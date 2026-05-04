using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Queries.GetAllTenants;

public sealed record GetAllTenantsQuery() : IQuery<Result<IReadOnlyList<TenantOverviewDto>>>;

public sealed record TenantOverviewDto(
    Guid TenantId,
    string Name,
    string ContactEmail,
    TenantStatus Status,
    DateTime ProvisionedAt,
    Guid? BillingAccountId,
    string? Currency,
    decimal? Balance,
    decimal? MonthSpent,
    decimal? MonthlyHardCap,
    decimal? LowBalanceThreshold);
