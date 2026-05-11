using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Enums;
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

    public async Task<IReadOnlyList<BillingAccount>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BillingAccount>> GetAccountsWithStaleReservationsAsync(
        DateTime thresholdUtc,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.Reservations.Any(r =>
                r.Status == ReservationStatus.Pending && r.CreatedAtUtc < thresholdUtc))
            .Include(a => a.Reservations)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BillingAccount>> GetAlertableLowBalanceAccountsAsync(
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.LowBalanceThreshold != null
                        && a.Balance <= a.LowBalanceThreshold
                        && a.LowBalanceAlertSentForCurrentDip)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> AnyWithPricingPlanAsync(
        Guid pricingPlanId,
        CancellationToken cancellationToken = default)
    {
        return DbSet.AnyAsync(a => a.CurrentPricingPlanId == pricingPlanId, cancellationToken);
    }
}
