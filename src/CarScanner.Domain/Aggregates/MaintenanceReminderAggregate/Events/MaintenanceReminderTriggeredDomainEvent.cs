using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Events;

public sealed record MaintenanceReminderTriggeredDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    Guid VehicleId,
    ReminderType Type,
    ReminderNotificationStage Stage,
    DateOnly? DueDate,
    int? DueMileage,
    string Description) : DomainEvent;
