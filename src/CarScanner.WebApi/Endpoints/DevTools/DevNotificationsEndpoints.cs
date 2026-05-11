using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.NotificationAggregate;
using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.WebApi.Endpoints.DevTools;

public static class DevNotificationsEndpoints
{
    public static IEndpointRouteBuilder MapDevNotificationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/dev/notifications")
            .WithTags("DevTools")
            .RequireAuthorization();

        group.MapPost("/test", TriggerTestNotification);

        return app;
    }

    private static async Task<IResult> TriggerTestNotification(
        TestNotificationRequest request,
        ITenantProvider tenantProvider,
        INotificationRepository notificationRepo,
        INotificationPusher pusher,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return Results.BadRequest(new { error = "Tenant context nije resolvovan iz JWT-a." });

        var severity = (NotificationSeverity)Math.Clamp(request.Severity, 0, 2);

        var notification = Notification.Create(
            tenantId,
            type: string.IsNullOrWhiteSpace(request.Type) ? "dev.test" : request.Type!,
            title: request.Title,
            message: request.Message,
            severity: severity,
            relatedEntityType: request.RelatedEntityType,
            relatedEntityId: request.RelatedEntityId);

        notificationRepo.Add(notification);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await pusher.PushToTenantAsync(
            tenantId,
            new NotificationPayload(
                notification.Id,
                notification.Type,
                notification.Title,
                notification.Message,
                (int)notification.Severity,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
                DateTime.UtcNow),
            cancellationToken);

        return Results.Ok(new { notification.Id, TenantId = tenantId });
    }

    public sealed record TestNotificationRequest(
        string Title,
        string Message,
        int Severity,
        string? Type = null,
        string? RelatedEntityType = null,
        Guid? RelatedEntityId = null);
}
