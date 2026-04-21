using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.RentalAggregate.Events;

public sealed record RentalStartedDomainEvent(
    Guid RentalId,
    Guid VehicleId,
    Guid ClientId,
    Guid PickupInspectionId) : DomainEvent;
