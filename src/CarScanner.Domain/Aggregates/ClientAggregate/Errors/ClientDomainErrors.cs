using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ClientAggregate.Errors;

public static class ClientDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Client", id);

    public static readonly DomainError InvalidFirstName =
        DomainError.Validation("Client.InvalidFirstName", "First name is required.");

    public static readonly DomainError InvalidLastName =
        DomainError.Validation("Client.InvalidLastName", "Last name is required.");

    public static readonly DomainError InvalidEmail =
        DomainError.Validation("Client.InvalidEmail", "A valid email is required.");

    public static readonly DomainError InvalidPhone =
        DomainError.Validation("Client.InvalidPhone", "Phone number is required.");

    public static readonly DomainError InvalidJmbg =
        DomainError.Validation("Client.InvalidJmbg", "JMBG must be exactly 13 digits.");

    public static readonly DomainError EmailAlreadyExists =
        new("Client.EmailAlreadyExists", "A client with this email already exists.");

    public static readonly DomainError DriverLicenseExpired =
        new("Client.DriverLicenseExpired", "Client's driver license has expired.");
}
