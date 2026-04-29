using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Repository;

public interface IAiUsageRecordRepository : IRepository<AiUsageRecord, Guid>
{
    Task<IReadOnlyList<AiUsageRecord>> GetForTenantAsync(
        Guid tenantId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AiUsageRecord>> GetByStatusAsync(
        AiUsageStatus status,
        CancellationToken cancellationToken = default);
}
