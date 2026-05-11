using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;

public static class ApplicationUserDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("ApplicationUser", id);

    public static readonly DomainError InvalidEmail =
        DomainError.Validation("ApplicationUser.InvalidEmail", "A valid email is required.");

    public static readonly DomainError InvalidPassword =
        DomainError.Validation("ApplicationUser.InvalidPassword", "Password is required.");

    public static readonly DomainError EmailAlreadyExists =
        new("ApplicationUser.EmailAlreadyExists", "A user with this email already exists.");

    public static readonly DomainError AccountSuspended =
        new("ApplicationUser.AccountSuspended", "Account is suspended and cannot perform this action.");

    public static readonly DomainError AccountInactive =
        new("ApplicationUser.AccountInactive", "Account is inactive.");

    public static readonly DomainError TokenNotFound =
        new("ApplicationUser.TokenNotFound", "Token was not found.");

    public static readonly DomainError TokenInvalid =
        new("ApplicationUser.TokenInvalid", "Token is not valid.");

    public static readonly DomainError TokenExpired =
        new("ApplicationUser.TokenExpired", "Token has expired.");

    public static readonly DomainError TokenAlreadyUsed =
        new("ApplicationUser.TokenAlreadyUsed", "Token has already been used.");

    public static readonly DomainError InvalidCredentials =
        new("ApplicationUser.InvalidCredentials", "Invalid email or password.");

    public static readonly DomainError InvalidCurrentPassword =
        new("ApplicationUser.InvalidCurrentPassword", "Current password is incorrect.");

    public static readonly DomainError FirstNameTooLong =
        DomainError.Validation("ApplicationUser.FirstNameTooLong", "First name cannot exceed 100 characters.");

    public static readonly DomainError LastNameTooLong =
        DomainError.Validation("ApplicationUser.LastNameTooLong", "Last name cannot exceed 100 characters.");

    public static DomainError InvalidProfileImage(string reason) =>
        DomainError.Validation("ApplicationUser.InvalidProfileImage", reason);
}
