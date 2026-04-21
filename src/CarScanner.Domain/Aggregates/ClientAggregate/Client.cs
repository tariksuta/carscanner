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
    public string? City { get; private set; }
    public DateOnly? BirthDate { get; private set; }
    public string? Jmbg { get; private set; }
    public bool IsVip { get; private set; }
    public bool MarketingConsent { get; private set; }
    public string? InternalNote { get; private set; }

    public string FullName => $"{FirstName} {LastName}";

    private Client() { }

    private Client(
        string firstName,
        string lastName,
        string email,
        string phone,
        DriverLicense driverLicense,
        string? address,
        string? city,
        DateOnly? birthDate,
        string? jmbg,
        bool isVip,
        bool marketingConsent,
        string? internalNote) : base()
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        DriverLicense = driverLicense;
        Address = address;
        City = city;
        BirthDate = birthDate;
        Jmbg = jmbg;
        IsVip = isVip;
        MarketingConsent = marketingConsent;
        InternalNote = internalNote;
    }

    public static Result<Client> Create(
        string firstName,
        string lastName,
        string email,
        string phone,
        string driverLicenseNumber,
        DateTime driverLicenseExpiry,
        string driverLicenseCountry,
        string? address,
        string? city,
        DateOnly? birthDate,
        string? jmbg,
        bool isVip,
        bool marketingConsent,
        string? internalNote)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure<Client>(ClientDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure<Client>(ClientDomainErrors.InvalidLastName);

        if (string.IsNullOrWhiteSpace(email) || !EmailRegex().IsMatch(email))
            return Result.Failure<Client>(ClientDomainErrors.InvalidEmail);

        if (string.IsNullOrWhiteSpace(phone))
            return Result.Failure<Client>(ClientDomainErrors.InvalidPhone);

        var normalizedJmbg = NormalizeJmbg(jmbg);
        if (normalizedJmbg is not null && !JmbgRegex().IsMatch(normalizedJmbg))
            return Result.Failure<Client>(ClientDomainErrors.InvalidJmbg);

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
            address?.Trim(),
            NormalizeOptional(city),
            birthDate,
            normalizedJmbg,
            isVip,
            marketingConsent,
            NormalizeOptional(internalNote));
    }

    public Result Update(
        string firstName,
        string lastName,
        string phone,
        string? address,
        string? city,
        DateOnly? birthDate,
        string? jmbg,
        bool isVip,
        bool marketingConsent,
        string? internalNote)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure(ClientDomainErrors.InvalidFirstName);

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure(ClientDomainErrors.InvalidLastName);

        if (string.IsNullOrWhiteSpace(phone))
            return Result.Failure(ClientDomainErrors.InvalidPhone);

        var normalizedJmbg = NormalizeJmbg(jmbg);
        if (normalizedJmbg is not null && !JmbgRegex().IsMatch(normalizedJmbg))
            return Result.Failure(ClientDomainErrors.InvalidJmbg);

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone.Trim();
        Address = address?.Trim();
        City = NormalizeOptional(city);
        BirthDate = birthDate;
        Jmbg = normalizedJmbg;
        IsVip = isVip;
        MarketingConsent = marketingConsent;
        InternalNote = NormalizeOptional(internalNote);

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

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeJmbg(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"^\d{13}$")]
    private static partial Regex JmbgRegex();
}
