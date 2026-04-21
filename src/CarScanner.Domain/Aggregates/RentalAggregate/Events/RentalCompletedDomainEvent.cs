using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.RentalAggregate.Events;

public sealed record RentalCompletedDomainEvent(
    Guid RentalId,
    Guid VehicleId,
    Guid ClientId,
    Guid PickupInspectionId,
    Guid ReturnInspectionId) : DomainEvent;
