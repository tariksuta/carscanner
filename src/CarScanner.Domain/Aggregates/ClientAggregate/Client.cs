using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.ValueObjects;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;
using System.Text.RegularExpressions;

namespace CarScanner.Domain.Aggregates.ClientAggregate;

public sealed partial class Client : AggregateRoot, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string Phone { get; private set; } = null!;
    public DriverLicense DriverLicense { get; private set; } = null!;
    public string? Address { get; private set; }

    public string FullName => $"{FirstName} {LastName}";

    private Client() { }

    private Client(
        string firstName,
        string lastName,
        string email,
        string phone,
        DriverLicense driverLicense,
        string? address) : base()
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        DriverLicense = driverLicense;
        Address = address;
    }

    public static Result<Client> Create(
        string firstName,
        string lastName,
        string email,
        string phone,
        string driverLicenseNumber,
        DateTime driverLicenseExpiry,
        string driverLicenseCountry,
        string? address)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure<Client>(ClientDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure<Client>(ClientDomainErrors.InvalidLastName);

        if (string.IsNullOrWhiteSpace(email) || !EmailRegex().IsMatch(email))
            return Result.Failure<Client>(ClientDomainErrors.InvalidEmail);

        if (string.IsNullOrWhiteSpace(phone))
            return Result.Failure<Client>(ClientDomainErrors.InvalidPhone);

        var driverLicenseResult = DriverLicense.Create(
            driverLicenseNumber,
            driverLicenseExpiry,
            driverLicenseCountry);

        if (driverLicenseResult.IsFailure)
            return Result.Failure<Client>(driverLicenseResult.Error);

        return new Client(
            firstName.Trim(),
            lastName.Trim(),
            email.Trim().ToLowerInvariant(),
            phone.Trim(),
            driverLicenseResult.Value,
            address?.Trim());
    }

    public Result Update(
        string firstName,
        string lastName,
        string phone,
        string? address)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure(ClientDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure(ClientDomainErrors.InvalidLastName);

        if (string.IsNullOrWhiteSpace(phone))
            return Result.Failure(ClientDomainErrors.InvalidPhone);

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone.Trim();
        Address = address?.Trim();

        return Result.Success();
    }

    public Result UpdateDriverLicense(
        string number,
        DateTime expiryDate,
        string issuingCountry)
    {
        var result = DriverLicense.Create(number, expiryDate, issuingCountry);
        if (result.IsFailure)
            return Result.Failure(result.Error);

        DriverLicense = result.Value;
        return Result.Success();
    }

    public bool CanRent() => !DriverLicense.IsExpired();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
