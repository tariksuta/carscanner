using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class ApplicationUserRepository(ApplicationDbContext dbContext)
    : Repository<ApplicationUser, Guid>(dbContext), IApplicationUserRepository
{
    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tokens)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);
    }

    public override async Task<ApplicationUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tokens)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
