using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.ClientAggregate.Repository;

public interface IClientRepository : IRepository<Client, Guid>
{
    Task<Client?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Client>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}
