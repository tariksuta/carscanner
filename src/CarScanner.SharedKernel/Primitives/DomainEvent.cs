using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.SharedKernel.Primitives;

public abstract record DomainEvent : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; } = DateTime.UtcNow;
}
