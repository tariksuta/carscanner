using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.InspectionAggregate.Events;

public sealed record InspectionCreatedDomainEvent(
    Guid InspectionId,
    Guid RentalId,
    Guid VehicleId,
    InspectionType InspectionType) : DomainEvent;
