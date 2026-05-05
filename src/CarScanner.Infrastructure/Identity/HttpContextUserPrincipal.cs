using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.SharedKernel.Constants;
using Microsoft.AspNetCore.Http;

namespace CarScanner.Infrastructure.Identity;

public sealed class HttpContextUserPrincipal : IUserPrincipal
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextUserPrincipal(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private System.Security.Claims.ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid UserId
    {
        get
        {
            var value = User?.FindFirst(ClaimConstants.JwtSub)?.Value;
            return !string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out var parsed)
                ? parsed
                : Guid.Empty;
        }
    }

    public Guid? TenantId
    {
        get
        {
            var value = User?.FindFirst(ClaimConstants.JwtTenantId)?.Value;
            return !string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out var parsed)
                ? parsed
                : null;
        }
    }

    public string Email => User?.FindFirst(ClaimConstants.JwtEmail)?.Value ?? string.Empty;

    public List<string> Roles =>
        User?.FindAll(ClaimConstants.JwtRole).Select(c => c.Value).ToList() ?? new List<string>();
}
