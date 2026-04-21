using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.RentalAggregate.Repository;

public interface IRentalRepository : IRepository<Rental, Guid>
{
    Task<IReadOnlyList<Rental>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Rental>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Rental>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Rental>> GetByStatusAsync(RentalStatus status, CancellationToken cancellationToken = default);
    Task<Rental?> GetActiveRentalByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Rental>> GetActiveRentalsAsync(CancellationToken cancellationToken = default);
}
