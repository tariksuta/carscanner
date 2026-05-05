using CarScanner.Domain.Enums;

namespace CarScanner.Application.Features.Notifications.Dtos;

public sealed record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    NotificationSeverity Severity,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    bool IsRead,
    DateTime? ReadAtUtc,
    DateTime CreatedOnUtc);
