using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.Application.Abstraction.Billing;
using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.BillingAggregate.Services;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.Billing;

public sealed class BillingService(
    IBillingAccountRepository accountRepo,
    IPricingPlanRepository planRepo,
    IAiUsageRecordRepository usageRepo,
    IPricingCalculator calculator,
    ITenantProvider tenantProvider,
    IUnitOfWork uow,
    ILogger<BillingService> logger)
    : IBillingService
{
    private static readonly DomainError NoDefaultPlan =
        new("Billing.NoDefaultPlan", "No default pricing plan is configured.");

    private static readonly DomainError MissingTenantContext =
        new("Billing.MissingTenantContext", "Tenant context is missing on the request.");

    private static readonly DomainError PlanNotFound =
        new("Billing.PlanNotFound", "Pricing plan referenced by reservation was not found.");

    public async Task<Result<BillingTicket>> ReserveAsync(
        int photoPairCount,
        string model,
        Guid? damageReportId,
        string feature,
        CancellationToken cancellationToken = default)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return Result.Failure<BillingTicket>(MissingTenantContext);

        var plan = await planRepo.GetDefaultAsync(cancellationToken);
        if (plan is null)
            return Result.Failure<BillingTicket>(NoDefaultPlan);

        var estimate = calculator.Estimate(photoPairCount, plan, model);

        var account = await accountRepo.GetByTenantIdAsync(tenantId, cancellationToken);
        if (account is null)
            return Result.Failure<BillingTicket>(BillingDomainErrors.NotFoundForTenant(tenantId));

        var reserveResult = account.Reserve(estimate, DateTime.UtcNow);
        if (reserveResult.IsFailure)
            return Result.Failure<BillingTicket>(reserveResult.Error);

        await uow.SaveChangesAsync(cancellationToken);

        return new BillingTicket(
            tenantId,
            account.Id,
            reserveResult.Value.Id,
            plan.Id,
            model,
            estimate,
            damageReportId,
            feature);
    }

    public async Task<Result> CommitAsync(
        BillingTicket ticket,
        TokenUsage? usage,
        string? fallbackContext,
        CancellationToken cancellationToken = default)
    {
        var nowUtc = DateTime.UtcNow;
        var account = await accountRepo.GetByTenantIdAsync(ticket.TenantId, cancellationToken);
        if (account is null)
        {
            logger.LogError(
                "Billing account missing during Commit for reservation {ReservationId}",
                ticket.ReservationId);
            return Result.Failure(BillingDomainErrors.NotFoundForTenant(ticket.TenantId));
        }

        AiUsageRecord usageRecord;

        if (usage is null)
        {
            var commit = account.CommitReservation(ticket.ReservationId, ticket.Estimate, nowUtc);
            if (commit.IsFailure) return commit;

            usageRecord = AiUsageRecord.EstimatedFallback(
                ticket.TenantId, ticket.BillingAccountId, ticket.DamageReportId,
                ticket.Feature, ticket.Model,
                ticket.Estimate, ticket.ReservationId,
                fallbackContext ?? "Usage data missing from AI response",
                nowUtc);
        }
        else
        {
            var plan = await planRepo.GetByIdAsync(ticket.PricingPlanId, cancellationToken);
            if (plan is null)
            {
                logger.LogError(
                    "Pricing plan {PlanId} missing during Commit for reservation {ReservationId}",
                    ticket.PricingPlanId, ticket.ReservationId);
                return Result.Failure(PlanNotFound);
            }

            var pricingResult = calculator.Compute(
                usage.PromptTokens, usage.CompletionTokens, usage.Model, plan);

            if (pricingResult.IsFailure)
            {
                var commit = account.CommitReservation(ticket.ReservationId, ticket.Estimate, nowUtc);
                if (commit.IsFailure) return commit;

                usageRecord = AiUsageRecord.EstimatedFallback(
                    ticket.TenantId, ticket.BillingAccountId, ticket.DamageReportId,
                    ticket.Feature, usage.Model,
                    ticket.Estimate, ticket.ReservationId,
                    $"Pricing not configured for model '{usage.Model}'",
                    nowUtc);
            }
            else
            {
                var charged = pricingResult.Value.ChargedAmount;
                var commit = account.CommitReservation(ticket.ReservationId, charged, nowUtc);
                if (commit.IsFailure) return commit;

                usageRecord = AiUsageRecord.Committed(
                    ticket.TenantId, ticket.BillingAccountId, ticket.DamageReportId,
                    ticket.Feature, usage.Model,
                    usage.PromptTokens, usage.CompletionTokens,
                    pricingResult.Value.RawCostUsd, charged,
                    ticket.ReservationId, nowUtc);
            }
        }

        usageRepo.Add(usageRecord);
        await uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> RefundAsync(
        BillingTicket ticket,
        string? errorContext,
        CancellationToken cancellationToken = default)
    {
        var nowUtc = DateTime.UtcNow;
        var account = await accountRepo.GetByTenantIdAsync(ticket.TenantId, cancellationToken);
        if (account is null)
        {
            logger.LogError(
                "Billing account missing during Refund for reservation {ReservationId}",
                ticket.ReservationId);
            return Result.Failure(BillingDomainErrors.NotFoundForTenant(ticket.TenantId));
        }

        var refundResult = account.RefundReservation(ticket.ReservationId, nowUtc);
        if (refundResult.IsFailure)
        {
            logger.LogWarning(
                "Refund domain check failed for reservation {ReservationId}: {Error}",
                ticket.ReservationId, refundResult.Error.Message);
            return refundResult;
        }

        usageRepo.Add(AiUsageRecord.Refunded(
            ticket.TenantId, ticket.BillingAccountId, ticket.DamageReportId,
            ticket.Feature, ticket.Model, ticket.ReservationId,
            errorContext, nowUtc));

        await uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<bool> CanAffordAsync(
        int photoPairCount,
        string model,
        CancellationToken cancellationToken = default)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty) return false;

        var plan = await planRepo.GetDefaultAsync(cancellationToken);
        if (plan is null) return false;

        var estimate = calculator.Estimate(photoPairCount, plan, model);

        var account = await accountRepo.GetByTenantIdAsync(tenantId, cancellationToken);
        if (account is null) return false;

        if (account.Balance < estimate) return false;

        if (account.MonthlyHardCap.HasValue
            && account.MonthSpent + estimate > account.MonthlyHardCap.Value)
            return false;

        return true;
    }
}
