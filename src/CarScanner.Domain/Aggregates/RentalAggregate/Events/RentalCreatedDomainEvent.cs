using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.RentalAggregate.Events;

public sealed record RentalCreatedDomainEvent(
    Guid RentalId,
    Guid VehicleId,
    Guid ClientId) : DomainEvent;
