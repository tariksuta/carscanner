using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ServiceBookAggregate.Events;

public sealed record ServiceRecordCreatedDomainEvent(
    Guid ServiceRecordId,
    Guid TenantId,
    Guid VehicleId,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type) : DomainEvent;
