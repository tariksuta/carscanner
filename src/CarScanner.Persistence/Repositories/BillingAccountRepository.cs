using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class BillingAccountRepository(ApplicationDbContext dbContext)
    : Repository<BillingAccount, Guid>(dbContext), IBillingAccountRepository
{
    public async Task<BillingAccount?> GetByTenantIdAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Reservations)
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);
    }

    public async Task<BillingAccount?> GetForCurrentTenantWithLockAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FromSqlInterpolated($"SELECT * FROM BillingAccounts WITH (UPDLOCK, ROWLOCK) WHERE TenantId = {tenantId}")
            .Include(b => b.Reservations)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
