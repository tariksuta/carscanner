using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Events;

public sealed record DamageDetectedDomainEvent(
    Guid DamageReportId,
    Guid RentalId,
    Guid ClientId,
    int DamageCount,
    decimal? TotalEstimatedCost) : DomainEvent;
