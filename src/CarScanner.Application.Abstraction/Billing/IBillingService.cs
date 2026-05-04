using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Abstraction.Billing;

public sealed record BillingTicket(
    Guid TenantId,
    Guid BillingAccountId,
    Guid ReservationId,
    Guid PricingPlanId,
    string Model,
    decimal Estimate,
    Guid? DamageReportId,
    string Feature);

public interface IBillingService
{
    Task<Result<BillingTicket>> ReserveAsync(
        int photoPairCount,
        string model,
        Guid? damageReportId,
        string feature,
        CancellationToken cancellationToken = default);

    Task<Result> CommitAsync(
        BillingTicket ticket,
        TokenUsage? usage,
        string? fallbackContext,
        CancellationToken cancellationToken = default);

    Task<Result> RefundAsync(
        BillingTicket ticket,
        string? errorContext,
        CancellationToken cancellationToken = default);

    Task<bool> CanAffordAsync(
        int photoPairCount,
        string model,
        CancellationToken cancellationToken = default);
}
