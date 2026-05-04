using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.TenantAggregate.Errors;

public static class TenantDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Tenant", id);

    public static readonly DomainError InvalidName =
        DomainError.Validation("Tenant.InvalidName", "Tenant name is required.");

    public static readonly DomainError NameTooLong =
        DomainError.Validation("Tenant.NameTooLong", "Tenant name cannot exceed 200 characters.");

    public static readonly DomainError InvalidEmail =
        DomainError.Validation("Tenant.InvalidEmail", "Contact email is required.");

    public static readonly DomainError EmailTooLong =
        DomainError.Validation("Tenant.EmailTooLong", "Contact email cannot exceed 256 characters.");

    public static readonly DomainError SuspensionReasonTooLong =
        DomainError.Validation("Tenant.SuspensionReasonTooLong", "Suspension reason cannot exceed 500 characters.");

    public static readonly DomainError AlreadySuspended =
        new("Tenant.AlreadySuspended", "Tenant is already suspended.");

    public static readonly DomainError AlreadyDeactivated =
        new("Tenant.AlreadyDeactivated", "Tenant is already deactivated.");

    public static readonly DomainError NotSuspended =
        new("Tenant.NotSuspended", "Tenant is not currently suspended.");
}
