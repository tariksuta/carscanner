using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Queries.GetAllTenants;

public sealed class GetAllTenantsQueryHandler(
    ITenantRepository tenantRepository,
    IBillingAccountRepository billingAccountRepository)
    : IQueryHandler<GetAllTenantsQuery, Result<IReadOnlyList<TenantOverviewDto>>>
{
    public async Task<Result<IReadOnlyList<TenantOverviewDto>>> Handle(
        GetAllTenantsQuery request,
        CancellationToken cancellationToken)
    {
        var tenants = await tenantRepository.GetAllAsync(cancellationToken);

        var items = new List<TenantOverviewDto>(tenants.Count);

        foreach (var tenant in tenants)
        {
            var account = await billingAccountRepository.GetByTenantIdAsync(tenant.Id, cancellationToken);

            items.Add(new TenantOverviewDto(
                tenant.Id,
                tenant.Name,
                tenant.ContactEmail,
                tenant.Status,
                tenant.ProvisionedAt,
                account?.Id,
                account?.Currency,
                account?.Balance,
                account?.MonthSpent,
                account?.MonthlyHardCap,
                account?.LowBalanceThreshold));
        }

        return Result.Success<IReadOnlyList<TenantOverviewDto>>(items);
    }
}
