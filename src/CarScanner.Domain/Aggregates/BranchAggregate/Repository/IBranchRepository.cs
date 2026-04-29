using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.BranchAggregate.Repository;

public interface IBranchRepository : IRepository<Branch, Guid>
{
    Task<IReadOnlyList<Branch>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Branch>> GetActiveAsync(CancellationToken cancellationToken = default);
}
