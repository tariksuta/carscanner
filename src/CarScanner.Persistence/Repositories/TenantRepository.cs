using CarScanner.Domain.Aggregates.TenantAggregate;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class TenantRepository(ApplicationDbContext dbContext)
    : Repository<Tenant, Guid>(dbContext), ITenantRepository
{
    public async Task<IReadOnlyList<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}
