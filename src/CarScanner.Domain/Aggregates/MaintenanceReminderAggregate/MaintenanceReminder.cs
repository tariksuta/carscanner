using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Errors;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;

public sealed class MaintenanceReminder : AggregateRoot, ITenantEntity
{
    public const int MaxDescriptionLength = 500;

    public Guid TenantId { get; set; }
    public Guid VehicleId { get; private set; }
    public ReminderType Type { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public int? DueMileage { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime? LastNotificationSentAtUtc { get; private set; }
    public ReminderNotificationStage NotificationStage { get; private set; }

    private MaintenanceReminder() { }

    private MaintenanceReminder(
        Guid tenantId,
        Guid vehicleId,
        ReminderType type,
        DateOnly? dueDate,
        int? dueMileage,
        string description) : base()
    {
        TenantId = tenantId;
        VehicleId = vehicleId;
        Type = type;
        DueDate = dueDate;
        DueMileage = dueMileage;
        Description = description;
        IsActive = true;
        NotificationStage = ReminderNotificationStage.None;
    }

    public static Result<MaintenanceReminder> Create(
        Guid tenantId,
        Guid vehicleId,
        ReminderType type,
        DateOnly? dueDate,
        int? dueMileage,
        string description)
    {
        if (vehicleId == Guid.Empty)
            return Result.Failure<MaintenanceReminder>(MaintenanceReminderDomainErrors.InvalidVehicleId);

        if (dueDate is null && dueMileage is null)
            return Result.Failure<MaintenanceReminder>(MaintenanceReminderDomainErrors.NoTrigger);

        if (dueMileage is { } km && km <= 0)
            return Result.Failure<MaintenanceReminder>(MaintenanceReminderDomainErrors.InvalidDueMileage);

        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure<MaintenanceReminder>(MaintenanceReminderDomainErrors.InvalidDescription);

        var trimmed = description.Trim();
        if (trimmed.Length > MaxDescriptionLength)
            return Result.Failure<MaintenanceReminder>(MaintenanceReminderDomainErrors.DescriptionTooLong);

        return new MaintenanceReminder(tenantId, vehicleId, type, dueDate, dueMileage, trimmed);
    }

    public Result Update(DateOnly? dueDate, int? dueMileage, string description)
    {
        if (dueDate is null && dueMileage is null)
            return Result.Failure(MaintenanceReminderDomainErrors.NoTrigger);

        if (dueMileage is { } km && km <= 0)
            return Result.Failure(MaintenanceReminderDomainErrors.InvalidDueMileage);

        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure(MaintenanceReminderDomainErrors.InvalidDescription);

        var trimmed = description.Trim();
        if (trimmed.Length > MaxDescriptionLength)
            return Result.Failure(MaintenanceReminderDomainErrors.DescriptionTooLong);

        // Reset notifikacija ako se due date pomakne unaprijed (npr. korisnik produzio registraciju).
        if (dueDate != DueDate || dueMileage != DueMileage)
            ResetNotifications();

        DueDate = dueDate;
        DueMileage = dueMileage;
        Description = trimmed;
        return Result.Success();
    }

    public Result Dismiss()
    {
        if (!IsActive)
            return Result.Failure(MaintenanceReminderDomainErrors.AlreadyDismissed);

        IsActive = false;
        return Result.Success();
    }

    public void Reactivate()
    {
        IsActive = true;
        ResetNotifications();
    }

    public void MarkNotificationSent(ReminderNotificationStage stage, DateTime nowUtc)
    {
        if (stage <= NotificationStage)
            return;

        NotificationStage = stage;
        LastNotificationSentAtUtc = nowUtc;

        RaiseDomainEvent(new MaintenanceReminderTriggeredDomainEvent(
            Id, TenantId, VehicleId, Type, stage, DueDate, DueMileage, Description));
    }

    public ReminderNotificationStage CalculateRequiredStage(DateOnly today, int? currentMileage)
    {
        if (DueDate is { } dueDate)
        {
            var daysUntilDue = (dueDate.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).Days;

            if (daysUntilDue < 0)
                return ReminderNotificationStage.Overdue;
            if (daysUntilDue <= 1)
                return ReminderNotificationStage.T1Day;
            if (daysUntilDue <= 7)
                return ReminderNotificationStage.T7Days;
            if (daysUntilDue <= 14)
                return ReminderNotificationStage.T14Days;
            if (daysUntilDue <= 30)
                return ReminderNotificationStage.T30Days;
        }

        if (DueMileage is { } dueKm && currentMileage is { } currentKm)
        {
            // KM-based: trigger kad je preostalo <= 10% praga (npr. servis na 60.000km, sa intervalom 10.000km - upozori na 59.000km)
            var distance = dueKm - currentKm;
            if (distance < 0)
                return ReminderNotificationStage.Overdue;
            if (distance <= 200)
                return ReminderNotificationStage.T1Day;
            if (distance <= 500)
                return ReminderNotificationStage.T7Days;
            if (distance <= 1000)
                return ReminderNotificationStage.T14Days;
            if (distance <= 2000)
                return ReminderNotificationStage.T30Days;
        }

        return ReminderNotificationStage.None;
    }

    private void ResetNotifications()
    {
        NotificationStage = ReminderNotificationStage.None;
        LastNotificationSentAtUtc = null;
    }
}
