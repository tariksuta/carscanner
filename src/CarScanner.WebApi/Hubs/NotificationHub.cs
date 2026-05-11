using CarScanner.Application.Abstraction.Tenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CarScanner.WebApi.Hubs;

[Authorize]
public sealed class NotificationHub : Hub
{
    public const string ClientNotificationMethod = "notification";
    private const string PlatformAdminRole = "PlatformAdmin";
    private const string TenantQueryName = "tenantId";

    private readonly ITenantProvider _tenantProvider;

    public NotificationHub(ITenantProvider tenantProvider)
    {
        _tenantProvider = tenantProvider;
    }

    public override async Task OnConnectedAsync()
    {
        var tenantId = ResolveTenantForConnection();
        if (tenantId != Guid.Empty)
        {
            // Klijent ulazi u tenant grupu — sve notifikacije za tenant idu kroz ovu grupu.
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupNameForTenant(tenantId));
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var tenantId = ResolveTenantForConnection();
        if (tenantId != Guid.Empty)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNameForTenant(tenantId));
        }

        await base.OnDisconnectedAsync(exception);
    }

    public static string GroupNameForTenant(Guid tenantId) => $"tenant:{tenantId:N}";

    // Browser WebSocket konekcije ne mogu da postave custom HTTP header-e, pa PlatformAdmin
    // ne moze da posalje X-Tenant-Id na hub. Za njih dozvoljavamo tenantId iz query string-a
    // (samo na connection setup-u), gated na PlatformAdmin rolu. Obicni useri-i ostaju
    // ogranicen na JWT tenant_id claim — ne mogu da skacu izmedju tenanata preko query-ja.
    private Guid ResolveTenantForConnection()
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId != Guid.Empty)
            return tenantId;

        if (Context.User?.IsInRole(PlatformAdminRole) != true)
            return Guid.Empty;

        var http = Context.GetHttpContext();
        if (http is null)
            return Guid.Empty;

        if (http.Request.Query.TryGetValue(TenantQueryName, out var qsValue)
            && Guid.TryParse(qsValue, out var fromQuery))
            return fromQuery;

        return Guid.Empty;
    }
}
