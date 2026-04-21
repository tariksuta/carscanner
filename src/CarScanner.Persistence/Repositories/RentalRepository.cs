using CarScanner.Domain.Aggregates.RentalAggregate;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class RentalRepository(ApplicationDbContext dbContext)
    : Repository<Rental, Guid>(dbContext), IRentalRepository
{
    public async Task<IReadOnlyList<Rental>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Rental>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.ClientId == clientId)
            .OrderByDescending(r => r.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Rental>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Rental>> GetByStatusAsync(RentalStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<Rental?> GetActiveRentalByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(r =>
                r.VehicleId == vehicleId &&
                r.Status != RentalStatus.Completed &&
                r.Status != RentalStatus.Cancelled,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Rental>> GetActiveRentalsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => r.Status == RentalStatus.Active || r.Status == RentalStatus.PickupInProgress || r.Status == RentalStatus.ReturnInProgress)
            .ToListAsync(cancellationToken);
    }
}
