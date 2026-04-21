using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Events;

public sealed record DamageAnalysisRequestedDomainEvent(
    Guid DamageReportId,
    Guid RentalId,
    Guid PickupInspectionId,
    Guid ReturnInspectionId) : DomainEvent;
