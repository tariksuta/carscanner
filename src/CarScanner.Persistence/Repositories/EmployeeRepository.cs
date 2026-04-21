using CarScanner.Domain.Aggregates.EmployeeAggregate;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class EmployeeRepository(ApplicationDbContext dbContext)
    : Repository<Employee, Guid>(dbContext), IEmployeeRepository
{
    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(e => e.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => e.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(e => e.Email == email.ToLowerInvariant(), cancellationToken);
    }
}
