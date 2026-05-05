using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.NotificationAggregate;

public sealed class Notification : AggregateRoot, ITenantEntity
{
    public const int MaxTitleLength = 200;
    public const int MaxMessageLength = 1000;
    public const int MaxTypeLength = 100;
    public const int MaxRelatedEntityTypeLength = 100;

    public Guid TenantId { get; set; }
    public string Type { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public NotificationSeverity Severity { get; private set; }
    public string? RelatedEntityType { get; private set; }
    public Guid? RelatedEntityId { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAtUtc { get; private set; }

    private Notification() { }

    private Notification(
        Guid tenantId,
        string type,
        string title,
        string message,
        NotificationSeverity severity,
        string? relatedEntityType,
        Guid? relatedEntityId) : base()
    {
        TenantId = tenantId;
        Type = type;
        Title = title;
        Message = message;
        Severity = severity;
        RelatedEntityType = relatedEntityType;
        RelatedEntityId = relatedEntityId;
        IsRead = false;
    }

    public static Notification Create(
        Guid tenantId,
        string type,
        string title,
        string message,
        NotificationSeverity severity = NotificationSeverity.Info,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null)
    {
        return new Notification(
            tenantId,
            Truncate(type, MaxTypeLength),
            Truncate(title, MaxTitleLength),
            Truncate(message, MaxMessageLength),
            severity,
            relatedEntityType is null ? null : Truncate(relatedEntityType, MaxRelatedEntityTypeLength),
            relatedEntityId);
    }

    public void MarkAsRead(DateTime nowUtc)
    {
        if (IsRead)
            return;

        IsRead = true;
        ReadAtUtc = nowUtc;
    }

    private static string Truncate(string value, int max) =>
        string.IsNullOrEmpty(value) || value.Length <= max ? value ?? string.Empty : value[..max];
}
