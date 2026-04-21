using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;

public static class EmployeeDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Employee", id);

    public static readonly DomainError InvalidFirstName =
        DomainError.Validation("Employee.InvalidFirstName", "First name is required.");

    public static readonly DomainError InvalidLastName =
        DomainError.Validation("Employee.InvalidLastName", "Last name is required.");

    public static readonly DomainError InvalidEmail =
        DomainError.Validation("Employee.InvalidEmail", "A valid email is required.");

    public static readonly DomainError EmailAlreadyExists =
        new("Employee.EmailAlreadyExists", "An employee with this email already exists.");

    public static readonly DomainError Inactive =
        new("Employee.Inactive", "Employee is inactive and cannot perform this action.");

    public static readonly DomainError AlreadyHasLoginAccess =
        new("Employee.AlreadyHasLoginAccess", "Employee already has login access.");

    public static readonly DomainError NoLoginAccess =
        new("Employee.NoLoginAccess", "Employee does not have login access.");
}
