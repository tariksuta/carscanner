using CarScanner.Domain.Enums;

namespace CarScanner.Application.Features.ServiceBook.Dtos;

public sealed record ReminderDto(
    Guid Id,
    Guid VehicleId,
    string VehicleDisplayName,
    ReminderType Type,
    DateOnly? DueDate,
    int? DueMileage,
    string Description,
    bool IsActive,
    ReminderNotificationStage NotificationStage,
    DateTime? LastNotificationSentAtUtc,
    int? DaysUntilDue);
