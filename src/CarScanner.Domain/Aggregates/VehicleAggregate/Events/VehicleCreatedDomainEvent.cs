using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.Events;

public sealed record VehicleCreatedDomainEvent(
    Guid VehicleId,
    DateOnly? RegistrationExpiry,
    DateOnly? InsuranceExpiry) : DomainEvent;
