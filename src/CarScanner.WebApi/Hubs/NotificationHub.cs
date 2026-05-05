using CarScanner.Application.Abstraction.Tenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CarScanner.WebApi.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    public const string ClientNotificationMethod = "notification";

    private readonly ITenantProvider _tenantProvider;

    public NotificationHub(ITenantProvider tenantProvider)
    {
        _tenantProvider = tenantProvider;
    }

    public override async Task OnConnectedAsync()
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId != Guid.Empty)
        {
            // Klijent ulazi u tenant grupu — sve notifikacije za tenant idu kroz ovu grupu.
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupNameForTenant(tenantId));
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId != Guid.Empty)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNameForTenant(tenantId));
        }

        await base.OnDisconnectedAsync(exception);
    }

    public static string GroupNameForTenant(Guid tenantId) => $"tenant:{tenantId:N}";
}
