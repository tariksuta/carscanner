using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.TenantAggregate.Events;

public sealed record TenantSuspendedDomainEvent(
    Guid TenantId,
    string? Reason) : DomainEvent;
