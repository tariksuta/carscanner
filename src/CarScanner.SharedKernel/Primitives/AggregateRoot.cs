using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.SharedKernel.Primitives;

public abstract class AggregateRoot : AggregateRoot<Guid>
{
    protected AggregateRoot() : base(Guid.NewGuid()) { }

    protected AggregateRoot(Guid id) : base(id) { }
}

public abstract class AggregateRoot<TKey> : AuditableEntity<TKey>, IAggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];

    protected AggregateRoot() { }

    protected AggregateRoot(TKey id) : base(id) { }

    public IReadOnlyCollection<IDomainEvent> GetDomainEvents() => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
}
