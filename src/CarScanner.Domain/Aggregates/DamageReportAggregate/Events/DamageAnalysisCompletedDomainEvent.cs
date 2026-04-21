using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Events;

public sealed record DamageAnalysisCompletedDomainEvent(
    Guid DamageReportId,
    Guid RentalId,
    bool HasDamages) : DomainEvent;
