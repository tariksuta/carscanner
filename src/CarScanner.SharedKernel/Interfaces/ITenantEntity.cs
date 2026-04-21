namespace CarScanner.SharedKernel.Interfaces;

public interface ITenantEntity
{
    Guid TenantId { get; set; }
}

public interface ITenantOptionalEntity
{
    Guid? TenantId { get; set; }
}
