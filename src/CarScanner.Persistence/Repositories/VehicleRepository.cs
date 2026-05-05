using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class VehicleRepository(ApplicationDbContext dbContext)
    : Repository<Vehicle, Guid>(dbContext), IVehicleRepository
{
    public async Task<Vehicle?> GetByLicensePlateAsync(string licensePlate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(v => v.LicensePlate.Value == licensePlate.ToUpperInvariant(), cancellationToken);
    }

    public async Task<Vehicle?> GetByVinAsync(string vin, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(v => v.Vin == vin.ToUpperInvariant(), cancellationToken);
    }

    public async Task<IReadOnlyList<Vehicle>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Vehicle>> GetAvailableVehiclesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.Status == VehicleStatus.Available)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vehicle?> GetWithImagesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Images)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Vehicle>> GetAllWithPrimaryImageAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Images.Where(i => i.IsPrimary))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Vehicle>> GetAvailableVehiclesWithPrimaryImageAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.Status == VehicleStatus.Available)
            .Include(v => v.Images.Where(i => i.IsPrimary))
            .ToListAsync(cancellationToken);
    }

    public async Task<Vehicle?> GetByIdAcrossTenantsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .IgnoreQueryFilters()
            .Where(v => !v.IsDeleted)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }
}
