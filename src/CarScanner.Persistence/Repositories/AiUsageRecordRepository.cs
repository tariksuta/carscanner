using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class AiUsageRecordRepository(ApplicationDbContext dbContext)
    : Repository<AiUsageRecord, Guid>(dbContext), IAiUsageRecordRepository
{
    public async Task<IReadOnlyList<AiUsageRecord>> GetForTenantAsync(
        Guid tenantId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.TenantId == tenantId
                        && r.CreatedAtUtc >= fromUtc
                        && r.CreatedAtUtc < toUtc)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AiUsageRecord>> GetByStatusAsync(
        AiUsageStatus status,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.Status == status)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
