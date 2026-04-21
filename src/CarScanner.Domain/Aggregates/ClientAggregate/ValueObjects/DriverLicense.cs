using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ClientAggregate.ValueObjects;

public sealed class DriverLicense : ValueObject
{
    public string Number { get; }
    public DateTime ExpiryDate { get; }
    public string IssuingCountry { get; }

    private DriverLicense(string number, DateTime expiryDate, string issuingCountry)
    {
        Number = number;
        ExpiryDate = expiryDate;
        IssuingCountry = issuingCountry;
    }

    public static Result<DriverLicense> Create(string number, DateTime expiryDate, string issuingCountry)
    {
        if (string.IsNullOrWhiteSpace(number))
        {
            return Result.Failure<DriverLicense>(
                DomainError.Validation("DriverLicense.EmptyNumber", "Driver license number cannot be empty."));
        }

        if (number.Trim().Length != 9)
        {
            return Result.Failure<DriverLicense>(
                DomainError.Validation("DriverLicense.InvalidNumberLength", "Driver license number must be exactly 9 characters."));
        }

        if (expiryDate < DateTime.UtcNow.Date)
        {
            return Result.Failure<DriverLicense>(
                DomainError.Validation("DriverLicense.Expired", "Driver license has expired."));
        }

        if (string.IsNullOrWhiteSpace(issuingCountry))
        {
            return Result.Failure<DriverLicense>(
                DomainError.Validation("DriverLicense.EmptyCountry", "Issuing country cannot be empty."));
        }

        return new DriverLicense(
            number.Trim().ToUpperInvariant(),
            expiryDate,
            issuingCountry.Trim());
    }

    public bool IsExpired() => ExpiryDate < DateTime.UtcNow.Date;

    protected override IEnumerable<object?> GetAtomicValues()
    {
        yield return Number;
        yield return ExpiryDate;
        yield return IssuingCountry;
    }
}
