using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public abstract class Repository<TEntity, TEntityId>(ApplicationDbContext dbContext)
    : IRepository<TEntity, TEntityId>
    where TEntity : AggregateRoot<TEntityId>
{
    protected readonly DbSet<TEntity> DbSet = dbContext.Set<TEntity>();

    public virtual async Task<TEntity?> GetByIdAsync(TEntityId id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(e => e.Id!.Equals(id), cancellationToken);
    }

    public virtual void Add(TEntity entity)
    {
        DbSet.Add(entity);
    }

    public virtual void Update(TEntity entity)
    {
        DbSet.Update(entity);
    }

    public virtual void Remove(TEntity entity)
    {
        DbSet.Remove(entity);
    }
}
