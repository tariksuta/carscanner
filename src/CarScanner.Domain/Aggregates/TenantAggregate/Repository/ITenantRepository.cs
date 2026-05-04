using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.TenantAggregate.Repository;

public interface ITenantRepository : IRepository<Tenant, Guid>
{
    Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);
}
