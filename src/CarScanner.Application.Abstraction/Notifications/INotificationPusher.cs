namespace CarScanner.Application.Abstraction.Notifications;

public interface INotificationPusher
{
    Task PushToTenantAsync(Guid tenantId, NotificationPayload payload, CancellationToken cancellationToken = default);
}

public sealed record NotificationPayload(
    Guid Id,
    string Type,
    string Title,
    string Message,
    int Severity,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    DateTime CreatedAtUtc);
