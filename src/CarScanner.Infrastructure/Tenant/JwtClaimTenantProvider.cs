using CarScanner.Application.Abstraction.Tenant;
using CarScanner.SharedKernel.Constants;
using Microsoft.AspNetCore.Http;

namespace CarScanner.Infrastructure.Tenant;

/// <summary>
/// Resolves the current tenant from the authenticated user's JWT 'tenant_id' claim.
/// The 'X-Tenant-Id' HTTP header is honored ONLY for users in the PlatformAdmin role
/// — that's how the SaaS owner switches tenant context when admin-ing different tenants.
/// Regular users have their tenant cemented by the JWT claim and cannot override it.
/// </summary>
public sealed class JwtClaimTenantProvider : ITenantProvider
{
    private const string TenantHeaderName = "X-Tenant-Id";
    private const string PlatformAdminRole = "PlatformAdmin";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public JwtClaimTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext is null)
                return Guid.Empty;

            var user = httpContext.User;
            var isPlatformAdmin = user?.IsInRole(PlatformAdminRole) == true;

            // PlatformAdmin: header takes priority so they can target a specific tenant
            // when calling tenant-scoped admin endpoints. Without a header, they have no
            // implicit tenant — most PlatformAdmin endpoints query across tenants anyway.
            if (isPlatformAdmin)
            {
                if (httpContext.Request.Headers.TryGetValue(TenantHeaderName, out var adminHeader)
                    && Guid.TryParse(adminHeader, out var fromHeader))
                    return fromHeader;

                return Guid.Empty;
            }

            // Regular user: tenant is whatever the JWT claim says, period.
            var claimValue = user?.FindFirst(ClaimConstants.JwtTenantId)?.Value;
            if (!string.IsNullOrWhiteSpace(claimValue) && Guid.TryParse(claimValue, out var fromClaim))
                return fromClaim;

            return Guid.Empty;
        }
    }
}
