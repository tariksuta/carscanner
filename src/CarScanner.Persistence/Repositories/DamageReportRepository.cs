using CarScanner.Domain.Aggregates.DamageReportAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class DamageReportRepository(ApplicationDbContext dbContext)
    : Repository<DamageReport, Guid>(dbContext), IDamageReportRepository
{
    public async Task<IReadOnlyList<DamageReport>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<DamageReport?> GetWithDamageItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.DamageItems)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<DamageReport?> GetByRentalIdAsync(Guid rentalId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.DamageItems)
            .FirstOrDefaultAsync(d => d.RentalId == rentalId, cancellationToken);
    }

    public async Task<IReadOnlyList<DamageReport>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.DamageItems)
            .Where(d => d.ClientId == clientId)
            .OrderByDescending(d => d.RequestedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DamageReport>> GetByStatusAsync(DamageReportStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DamageReport>> GetPendingReportsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => d.Status == DamageReportStatus.Pending)
            .OrderBy(d => d.RequestedAt)
            .ToListAsync(cancellationToken);
    }
}
