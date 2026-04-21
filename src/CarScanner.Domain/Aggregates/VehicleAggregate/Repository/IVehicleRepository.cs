using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.Repository;

public interface IVehicleRepository : IRepository<Vehicle, Guid>
{
    Task<Vehicle?> GetByLicensePlateAsync(string licensePlate, CancellationToken cancellationToken = default);
    Task<Vehicle?> GetByVinAsync(string vin, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Vehicle>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Vehicle>> GetAvailableVehiclesAsync(CancellationToken cancellationToken = default);
    Task<Vehicle?> GetWithImagesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Vehicle>> GetAllWithPrimaryImageAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Vehicle>> GetAvailableVehiclesWithPrimaryImageAsync(CancellationToken cancellationToken = default);
}
