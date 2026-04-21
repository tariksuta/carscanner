using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;
using System.Text.RegularExpressions;

namespace CarScanner.Domain.Aggregates.EmployeeAggregate;

public sealed partial class Employee : AggregateRoot, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; }

    // Optional reference to ApplicationUser for login capability
    public Guid? ApplicationUserId { get; private set; }
    public ApplicationUser? ApplicationUser { get; private set; }

    public string FullName => $"{FirstName} {LastName}";
    public bool HasLoginAccess => ApplicationUserId.HasValue;

    private Employee() { }

    private Employee(
        string firstName,
        string lastName,
        string email,
        string? phone) : base()
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        IsActive = true;
    }

    public static Result<Employee> Create(
        string firstName,
        string lastName,
        string email,
        string? phone)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure<Employee>(EmployeeDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure<Employee>(EmployeeDomainErrors.InvalidLastName);

        if (string.IsNullOrWhiteSpace(email) || !EmailRegex().IsMatch(email))
            return Result.Failure<Employee>(EmployeeDomainErrors.InvalidEmail);

        return new Employee(
            firstName.Trim(),
            lastName.Trim(),
            email.Trim().ToLowerInvariant(),
            phone?.Trim());
    }

    public Result Update(
        string firstName,
        string lastName,
        string? phone)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure(EmployeeDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure(EmployeeDomainErrors.InvalidLastName);

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone?.Trim();

        return Result.Success();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public Result LinkApplicationUser(ApplicationUser applicationUser)
    {
        if (!IsActive)
            return Result.Failure(EmployeeDomainErrors.Inactive);

        if (ApplicationUserId.HasValue)
            return Result.Failure(EmployeeDomainErrors.AlreadyHasLoginAccess);

        ApplicationUserId = applicationUser.Id;
        ApplicationUser = applicationUser;

        return Result.Success();
    }

    public Result UnlinkApplicationUser()
    {
        if (!ApplicationUserId.HasValue)
            return Result.Failure(EmployeeDomainErrors.NoLoginAccess);

        ApplicationUserId = null;
        ApplicationUser = null;

        return Result.Success();
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
