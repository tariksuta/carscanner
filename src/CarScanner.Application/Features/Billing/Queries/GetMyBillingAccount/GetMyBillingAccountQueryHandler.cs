using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Billing.Queries.GetMyBillingAccount;

public sealed class GetMyBillingAccountQueryHandler(
    IBillingAccountRepository accountRepo,
    IPricingPlanRepository planRepo,
    ITenantProvider tenantProvider)
    : IQueryHandler<GetMyBillingAccountQuery, Result<BillingAccountDto>>
{
    private static readonly DomainError MissingTenantContext =
        new("Billing.MissingTenantContext", "Tenant context is missing on the request.");

    public async Task<Result<BillingAccountDto>> Handle(
        GetMyBillingAccountQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return Result.Failure<BillingAccountDto>(MissingTenantContext);

        var account = await accountRepo.GetByTenantIdAsync(tenantId, cancellationToken);
        if (account is null)
            return Result.Failure<BillingAccountDto>(BillingDomainErrors.NotFoundForTenant(tenantId));

        string? planName = null;
        var markup = 1.0m;

        var plan = account.CurrentPricingPlanId.HasValue
            ? await planRepo.GetByIdAsync(account.CurrentPricingPlanId.Value, cancellationToken)
            : await planRepo.GetDefaultAsync(cancellationToken);

        if (plan is not null)
        {
            planName = plan.Name;
            markup = plan.MarkupMultiplier;
        }

        return new BillingAccountDto(
            account.Id,
            account.TenantId,
            account.Currency,
            account.Balance,
            account.LifetimeToppedUp,
            account.LifetimeSpent,
            account.MonthlyHardCap,
            account.MonthSpent,
            account.MonthAnchorUtc,
            account.LowBalanceThreshold,
            planName,
            markup);
    }
}
