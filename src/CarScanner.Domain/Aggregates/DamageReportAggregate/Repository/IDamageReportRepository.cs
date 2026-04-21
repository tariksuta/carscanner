using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;

public interface IDamageReportRepository : IRepository<DamageReport, Guid>
{
    Task<IReadOnlyList<DamageReport>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<DamageReport?> GetWithDamageItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DamageReport?> GetByRentalIdAsync(Guid rentalId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DamageReport>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DamageReport>> GetByStatusAsync(DamageReportStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DamageReport>> GetPendingReportsAsync(CancellationToken cancellationToken = default);
}
