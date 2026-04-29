using CarScanner.Domain.Aggregates.TenantAggregate.Errors;
using CarScanner.Domain.Aggregates.TenantAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.TenantAggregate;

public sealed class Tenant : AggregateRoot
{
    public const int MaxNameLength = 200;
    public const int MaxEmailLength = 256;
    public const int MaxSuspensionReasonLength = 500;

    public string Name { get; private set; } = null!;
    public string ContactEmail { get; private set; } = null!;
    public TenantStatus Status { get; private set; }
    public DateTime ProvisionedAt { get; private set; }
    public string? SuspensionReason { get; private set; }

    private Tenant() { }

    private Tenant(string name, string contactEmail) : base()
    {
        Name = name;
        ContactEmail = contactEmail;
        Status = TenantStatus.Active;
        ProvisionedAt = DateTime.UtcNow;
    }

    public static Result<Tenant> Provision(string name, string contactEmail)
    {
        var validation = ValidateNameAndEmail(name, contactEmail);
        if (validation.IsFailure)
            return Result.Failure<Tenant>(validation.Error);

        var tenant = new Tenant(name.Trim(), contactEmail.Trim());
        tenant.RaiseDomainEvent(new TenantProvisionedDomainEvent(
            tenant.Id,
            tenant.Name,
            tenant.ContactEmail));

        return tenant;
    }

    public Result Suspend(string reason)
    {
        if (Status == TenantStatus.Deactivated)
            return Result.Failure(TenantDomainErrors.AlreadyDeactivated);

        if (Status == TenantStatus.Suspended)
            return Result.Failure(TenantDomainErrors.AlreadySuspended);

        var trimmed = (reason ?? string.Empty).Trim();
        if (trimmed.Length > MaxSuspensionReasonLength)
            return Result.Failure(TenantDomainErrors.SuspensionReasonTooLong);

        Status = TenantStatus.Suspended;
        SuspensionReason = string.IsNullOrEmpty(trimmed) ? null : trimmed;

        RaiseDomainEvent(new TenantSuspendedDomainEvent(Id, SuspensionReason));

        return Result.Success();
    }

    public Result Reactivate()
    {
        if (Status != TenantStatus.Suspended)
            return Result.Failure(TenantDomainErrors.NotSuspended);

        Status = TenantStatus.Active;
        SuspensionReason = null;

        return Result.Success();
    }

    public Result Deactivate()
    {
        if (Status == TenantStatus.Deactivated)
            return Result.Failure(TenantDomainErrors.AlreadyDeactivated);

        Status = TenantStatus.Deactivated;

        return Result.Success();
    }

    public Result UpdateContact(string name, string contactEmail)
    {
        var validation = ValidateNameAndEmail(name, contactEmail);
        if (validation.IsFailure)
            return validation;

        Name = name.Trim();
        ContactEmail = contactEmail.Trim();

        return Result.Success();
    }

    private static Result ValidateNameAndEmail(string name, string contactEmail)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(TenantDomainErrors.InvalidName);

        if (name.Trim().Length > MaxNameLength)
            return Result.Failure(TenantDomainErrors.NameTooLong);

        if (string.IsNullOrWhiteSpace(contactEmail))
            return Result.Failure(TenantDomainErrors.InvalidEmail);

        if (contactEmail.Trim().Length > MaxEmailLength)
            return Result.Failure(TenantDomainErrors.EmailTooLong);

        return Result.Success();
    }
}
