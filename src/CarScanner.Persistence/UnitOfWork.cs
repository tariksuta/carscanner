using CarScanner.Application.Abstraction.Tenant;
using CarScanner.SharedKernel.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence;

public sealed class UnitOfWork(
    ApplicationDbContext dbContext,
    ITenantProvider tenantProvider,
    IPublisher publisher) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AuditEntities();
        AssignTenantId();

        var domainEvents = GetDomainEvents();

        // Diagnostic: log tracked entities before save
        foreach (var entry in dbContext.ChangeTracker.Entries())
        {
            if (entry.State != EntityState.Unchanged)
            {
                Console.WriteLine($"[UoW] Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
            }
        }

        try
        {
            var result = await dbContext.SaveChangesAsync(cancellationToken);
            await PublishDomainEventsAsync(domainEvents, cancellationToken);
            return result;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            foreach (var entry in ex.Entries)
            {
                Console.WriteLine($"[UoW CONCURRENCY ERROR] Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                var dbValues = await entry.GetDatabaseValuesAsync(cancellationToken);
                if (dbValues is null)
                    Console.WriteLine($"[UoW CONCURRENCY ERROR] Row was DELETED from database");
                else
                    Console.WriteLine($"[UoW CONCURRENCY ERROR] Row exists - RowVersion mismatch");
            }
            throw;
        }
    }

    private void AuditEntities()
    {
        var entries = dbContext.ChangeTracker.Entries<IAuditableEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedOnUtc = DateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.ModifiedOnUtc = DateTime.UtcNow;
                    break;

                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedOnUtc = DateTime.UtcNow;
                    break;
            }
        }
    }

    private void AssignTenantId()
    {
        var entries = dbContext.ChangeTracker.Entries<ITenantEntity>()
            .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty);

        foreach (var entry in entries)
        {
            entry.Entity.TenantId = tenantProvider.TenantId;
        }
    }

    private List<IDomainEvent> GetDomainEvents()
    {
        var aggregateRoots = dbContext.ChangeTracker
            .Entries<IAggregateRoot>()
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = aggregateRoots
            .SelectMany(ar => ar.GetDomainEvents())
            .ToList();

        foreach (var aggregateRoot in aggregateRoots)
        {
            aggregateRoot.ClearDomainEvents();
        }

        return domainEvents;
    }

    private async Task PublishDomainEventsAsync(
        List<IDomainEvent> domainEvents,
        CancellationToken cancellationToken)
    {
        foreach (var domainEvent in domainEvents)
        {
            await publisher.Publish(domainEvent, cancellationToken);
        }
    }
}
