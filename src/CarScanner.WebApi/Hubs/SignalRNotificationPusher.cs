using CarScanner.Application.Abstraction.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace CarScanner.WebApi.Hubs;

public sealed class SignalRNotificationPusher : INotificationPusher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationPusher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PushToTenantAsync(
        Guid tenantId,
        NotificationPayload payload,
        CancellationToken cancellationToken = default)
    {
        return _hubContext.Clients
            .Group(NotificationHub.GroupNameForTenant(tenantId))
            .SendAsync(NotificationHub.ClientNotificationMethod, payload, cancellationToken);
    }
}
