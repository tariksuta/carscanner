using CarScanner.Domain.Aggregates.ClientAggregate;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class ClientRepository(ApplicationDbContext dbContext)
    : Repository<Client, Guid>(dbContext), IClientRepository
{
    public async Task<Client?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(c => c.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Client>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLowerInvariant();
        return await DbSet
            .Where(c => c.FirstName.ToLower().Contains(term) || c.LastName.ToLower().Contains(term))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(c => c.Email == email.ToLowerInvariant(), cancellationToken);
    }
}
