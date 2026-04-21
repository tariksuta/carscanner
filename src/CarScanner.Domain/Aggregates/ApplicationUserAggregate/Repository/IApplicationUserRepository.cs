using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;

public interface IApplicationUserRepository : IRepository<ApplicationUser, Guid>
{
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}
