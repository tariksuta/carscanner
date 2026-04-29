using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class VehicleInspectionRepository(ApplicationDbContext dbContext)
    : Repository<VehicleInspection, Guid>(dbContext), IVehicleInspectionRepository
{
    public async Task<IReadOnlyList<VehicleInspection>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<VehicleInspection?> GetWithPhotosAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.Photos)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<VehicleInspection>> GetByRentalIdAsync(Guid rentalId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.Photos)
            .Where(i => i.RentalId == rentalId)
            .OrderBy(i => i.InspectionType)
            .ToListAsync(cancellationToken);
    }

    public async Task<VehicleInspection?> GetByRentalIdAndTypeAsync(Guid rentalId, InspectionType type, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.Photos)
            .FirstOrDefaultAsync(i => i.RentalId == rentalId && i.InspectionType == type, cancellationToken);
    }

    public async Task<IReadOnlyList<VehicleInspection>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.VehicleId == vehicleId)
            .OrderByDescending(i => i.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<VehicleInspection>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(i => i.EmployeeId == employeeId)
            .OrderByDescending(i => i.CreatedOnUtc)
            .ToListAsync(cancellationToken);
    }
}
