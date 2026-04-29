using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Repository;

public interface IBillingAccountRepository : IRepository<BillingAccount, Guid>
{
    Task<BillingAccount?> GetByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<BillingAccount?> GetForCurrentTenantWithLockAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);
}
