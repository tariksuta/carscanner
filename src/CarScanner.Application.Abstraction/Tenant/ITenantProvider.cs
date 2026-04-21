namespace CarScanner.Application.Abstraction.Tenant;

public interface ITenantProvider
{
    Guid TenantId { get; }
}
