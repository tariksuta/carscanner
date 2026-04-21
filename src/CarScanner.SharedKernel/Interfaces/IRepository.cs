using CarScanner.SharedKernel.Primitives;

namespace CarScanner.SharedKernel.Interfaces;

public interface IRepository<TEntity, TEntityId> where TEntity : AggregateRoot<TEntityId>
{
    Task<TEntity?> GetByIdAsync(TEntityId id, CancellationToken cancellationToken = default);
    void Add(TEntity entity);
    void Update(TEntity entity);
    void Remove(TEntity entity);
}
