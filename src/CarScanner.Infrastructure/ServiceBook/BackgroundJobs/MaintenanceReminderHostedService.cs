using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.NotificationAggregate;
using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.ServiceBook.BackgroundJobs;

/// <summary>
/// Periodicno skenira aktivne MaintenanceReminder zapise, racuna trenutni notification stage
/// i salje email + in-app notifikaciju za svaki reminder ciji je novi stage iznad
/// posljednjeg poslanog. Idempotentno: NotificationStage na reminderu sprjecava duple.
/// </summary>
public sealed class MaintenanceReminderHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<MaintenanceReminderHostedService> logger)
    : BackgroundService
{
    private static readonly TimeSpan ScanInterval = TimeSpan.FromHours(6);
    private const int DueWindowDays = 30;
    private const int RecentNotificationsLimit = 50;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("MaintenanceReminderHostedService started.");

        using var timer = new PeriodicTimer(ScanInterval);

        try
        {
            // Prvi tick odmah na start (PeriodicTimer ceka prvi interval), pa wait pa scan.
            await ScanRemindersOnceAsync(stoppingToken);

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await ScanRemindersOnceAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation("MaintenanceReminderHostedService cancelled — shutdown in progress.");
        }
    }

    private async Task ScanRemindersOnceAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            await ProcessRemindersAsync(scope, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "MaintenanceReminderHostedService scan tick failed.");
        }
    }

    private async Task ProcessRemindersAsync(IServiceScope scope, CancellationToken ct)
    {
        var reminderRepo = scope.ServiceProvider.GetRequiredService<IMaintenanceReminderRepository>();
        var vehicleRepo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
        var tenantRepo = scope.ServiceProvider.GetRequiredService<ITenantRepository>();
        var notificationRepo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
        var pusher = scope.ServiceProvider.GetRequiredService<INotificationPusher>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nowUtc = DateTime.UtcNow;

        var dateBased = await reminderRepo.GetActiveDueWithinAsync(today, DueWindowDays, ct);
        var mileageBased = await reminderRepo.GetActiveMileageBasedAsync(ct);

        var allReminders = dateBased.Concat(mileageBased).DistinctBy(r => r.Id).ToList();
        if (allReminders.Count == 0)
            return;

        var triggered = 0;

        foreach (var reminder in allReminders)
        {
            var vehicle = await vehicleRepo.GetByIdAcrossTenantsAsync(reminder.VehicleId, ct);
            if (vehicle is null)
                continue;

            var requiredStage = reminder.CalculateRequiredStage(today, vehicle.CurrentMileage);
            if (requiredStage <= reminder.NotificationStage || requiredStage == ReminderNotificationStage.None)
                continue;

            var tenant = await tenantRepo.GetByIdAsync(reminder.TenantId, ct);
            if (tenant is null || tenant.Status != TenantStatus.Active)
                continue;

            try
            {
                await DispatchReminderAsync(
                    reminder, vehicle, tenant.ContactEmail, tenant.Name,
                    requiredStage, today, notificationRepo, emailService, pusher, ct);

                reminder.MarkNotificationSent(requiredStage, nowUtc);
                triggered++;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Failed to dispatch reminder {ReminderId} for tenant {TenantId}",
                    reminder.Id, reminder.TenantId);
            }
        }

        if (triggered > 0)
        {
            await uow.SaveChangesAsync(ct);
            logger.LogInformation("Dispatched {Count} maintenance reminders.", triggered);
        }
    }

    private static async Task DispatchReminderAsync(
        MaintenanceReminder reminder,
        Vehicle vehicle,
        string contactEmail,
        string tenantName,
        ReminderNotificationStage stage,
        DateOnly today,
        INotificationRepository notificationRepo,
        IEmailNotificationService emailService,
        INotificationPusher pusher,
        CancellationToken ct)
    {
        var vehicleInfo = $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";
        var (title, message, severity) = BuildNotificationContent(reminder, vehicle, stage, today);

        // 1. Email
        await SendEmailAsync(reminder, vehicle, vehicleInfo, contactEmail, tenantName, today, emailService, ct);

        // 2. In-app Notification (DB)
        var notification = Notification.Create(
            reminder.TenantId,
            type: $"reminder.{reminder.Type.ToString().ToLowerInvariant()}",
            title: title,
            message: message,
            severity: severity,
            relatedEntityType: "Vehicle",
            relatedEntityId: reminder.VehicleId);

        notificationRepo.Add(notification);

        // 3. SignalR push (real-time bell update)
        await pusher.PushToTenantAsync(
            reminder.TenantId,
            new NotificationPayload(
                notification.Id,
                notification.Type,
                notification.Title,
                notification.Message,
                (int)notification.Severity,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
                DateTime.UtcNow),
            ct);
    }

    private static Task SendEmailAsync(
        MaintenanceReminder reminder,
        Vehicle vehicle,
        string vehicleInfo,
        string contactEmail,
        string tenantName,
        DateOnly today,
        IEmailNotificationService emailService,
        CancellationToken ct)
    {
        var daysUntilDue = reminder.DueDate.HasValue
            ? Math.Max(0, (int)(reminder.DueDate.Value.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).TotalDays)
            : 0;

        return reminder.Type switch
        {
            ReminderType.RegistrationExpiry when reminder.DueDate.HasValue =>
                emailService.SendRegistrationExpiryReminderAsync(
                    contactEmail, tenantName, vehicleInfo, reminder.DueDate.Value, daysUntilDue, ct),

            ReminderType.InsuranceExpiry when reminder.DueDate.HasValue =>
                emailService.SendInsuranceExpiryReminderAsync(
                    contactEmail, tenantName, vehicleInfo, reminder.DueDate.Value, daysUntilDue, ct),

            ReminderType.NextService or ReminderType.TechnicalInspection =>
                emailService.SendServiceDueReminderAsync(
                    contactEmail, tenantName, vehicleInfo, reminder.Description,
                    reminder.DueDate, reminder.DueMileage, vehicle.CurrentMileage, ct),

            _ =>
                emailService.SendCustomReminderAsync(
                    contactEmail, tenantName, vehicleInfo,
                    reminder.Type.ToString(), reminder.Description, reminder.DueDate, ct),
        };
    }

    private static (string Title, string Message, NotificationSeverity Severity) BuildNotificationContent(
        MaintenanceReminder reminder, Vehicle vehicle, ReminderNotificationStage stage, DateOnly today)
    {
        var vehicleInfo = $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";
        var severity = stage switch
        {
            ReminderNotificationStage.Overdue => NotificationSeverity.Critical,
            ReminderNotificationStage.T1Day => NotificationSeverity.Critical,
            ReminderNotificationStage.T7Days => NotificationSeverity.Warning,
            _ => NotificationSeverity.Info,
        };

        var title = reminder.Type switch
        {
            ReminderType.RegistrationExpiry => $"Registracija - {vehicleInfo}",
            ReminderType.InsuranceExpiry => $"Osiguranje - {vehicleInfo}",
            ReminderType.TechnicalInspection => $"Tehnički pregled - {vehicleInfo}",
            ReminderType.NextService => $"Servis dospijeva - {vehicleInfo}",
            _ => $"Podsjetnik - {vehicleInfo}",
        };

        var message = reminder.Description;
        return (title, message, severity);
    }
}
