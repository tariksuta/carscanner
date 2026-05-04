using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;

public interface IServiceRecordRepository : IRepository<ServiceRecord, Guid>
{
    Task<ServiceRecord?> GetByIdWithDocumentsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ServiceRecord>> GetByVehicleAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<ServiceRecord> Items, int TotalCount)> GetPagedAsync(
        Guid? vehicleId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<ServiceRecord?> GetLatestByVehicleAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);
}
