using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Billing.Queries.GetMyBillingAccount;

public sealed record GetMyBillingAccountQuery() : IQuery<Result<BillingAccountDto>>;

public sealed record BillingAccountDto(
    Guid AccountId,
    Guid TenantId,
    string Currency,
    decimal Balance,
    decimal LifetimeToppedUp,
    decimal LifetimeSpent,
    decimal? MonthlyHardCap,
    decimal MonthSpent,
    DateTime MonthAnchorUtc,
    decimal? LowBalanceThreshold,
    string? PlanName,
    decimal MarkupMultiplier);
