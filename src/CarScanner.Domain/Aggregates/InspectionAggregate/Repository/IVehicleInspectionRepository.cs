using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.InspectionAggregate.Repository;

public interface IVehicleInspectionRepository : IRepository<VehicleInspection, Guid>
{
    Task<IReadOnlyList<VehicleInspection>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<VehicleInspection?> GetWithPhotosAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleInspection>> GetByRentalIdAsync(Guid rentalId, CancellationToken cancellationToken = default);
    Task<VehicleInspection?> GetByRentalIdAndTypeAsync(Guid rentalId, InspectionType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleInspection>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
}
