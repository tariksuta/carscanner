using CarScanner.Domain.Aggregates.BranchAggregate;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class BranchRepository(ApplicationDbContext dbContext)
    : Repository<Branch, Guid>(dbContext), IBranchRepository
{
    public async Task<IReadOnlyList<Branch>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .OrderBy(b => b.City)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Branch>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => b.IsActive)
            .OrderBy(b => b.City)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }
}
