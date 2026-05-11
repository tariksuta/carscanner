using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.Events;

public sealed record VehicleRegistrationExpiryUpdatedDomainEvent(
    Guid VehicleId,
    DateOnly? OldExpiry,
    DateOnly? NewExpiry) : DomainEvent;
