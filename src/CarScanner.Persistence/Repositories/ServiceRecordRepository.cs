using CarScanner.Domain.Aggregates.ServiceBookAggregate;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class ServiceRecordRepository(ApplicationDbContext dbContext)
    : Repository<ServiceRecord, Guid>(dbContext), IServiceRecordRepository
{
    public async Task<ServiceRecord?> GetByIdWithDocumentsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Documents)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceRecord>> GetByVehicleAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.VehicleId == vehicleId)
            .Include(r => r.Documents)
            .OrderByDescending(r => r.ServiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<ServiceRecord> Items, int TotalCount)> GetPagedAsync(
        Guid? vehicleId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (vehicleId.HasValue)
            query = query.Where(r => r.VehicleId == vehicleId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.ServiceDate)
            .ThenByDescending(r => r.CreatedOnUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(r => r.Documents)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<ServiceRecord?> GetLatestByVehicleAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.ServiceDate)
            .ThenByDescending(r => r.MileageAtService)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
