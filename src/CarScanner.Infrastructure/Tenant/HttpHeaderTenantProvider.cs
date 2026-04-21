using CarScanner.Application.Abstraction.Tenant;
using Microsoft.AspNetCore.Http;

namespace CarScanner.Infrastructure.Tenant;

public sealed class HttpHeaderTenantProvider : ITenantProvider
{
    private const string TenantHeaderName = "X-Tenant-Id";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpHeaderTenantProvider(IHttpContextAccessor httpContextAccessor)
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

            if (httpContext.Request.Headers.TryGetValue(TenantHeaderName, out var tenantIdHeader))
            {
                if (Guid.TryParse(tenantIdHeader, out var tenantId))
                    return tenantId;
            }

            return Guid.Empty;
        }
    }
}
