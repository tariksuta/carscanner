using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.TenantAggregate.Events;

public sealed record TenantProvisionedDomainEvent(
    Guid TenantId,
    string Name,
    string ContactEmail) : DomainEvent;
