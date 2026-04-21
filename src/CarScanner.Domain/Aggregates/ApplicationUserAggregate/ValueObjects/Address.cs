using CarScanner.SharedKernel.Primitives;
using System.Text.RegularExpressions;

namespace CarScanner.Domain.Aggregates.ApplicationUserAggregate.ValueObjects;

public sealed partial class Address : ValueObject
{
    public const int MaxStreetLength = 200;
    public const int MaxCityLength = 100;
    public const int MaxZipCodeLength = 10;
    public const int MinZipCodeLength = 3;
    public const int MaxCountryLength = 100;

    public string Street { get; }
    public string City { get; }
    public string ZipCode { get; }
    public string Country { get; }

    private Address(string street, string city, string zipCode, string country)
    {
        Street = street;
        City = city;
        ZipCode = zipCode;
        Country = country;
    }

    public static Result<Address> Create(string street, string city, string zipCode, string country)
    {
        if (string.IsNullOrWhiteSpace(street))
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.EmptyStreet", "Street cannot be empty."));
        }

        if (street.Trim().Length > MaxStreetLength)
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.StreetTooLong", $"Street cannot exceed {MaxStreetLength} characters."));
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.EmptyCity", "City cannot be empty."));
        }

        if (city.Trim().Length > MaxCityLength)
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.CityTooLong", $"City cannot exceed {MaxCityLength} characters."));
        }

        if (string.IsNullOrWhiteSpace(zipCode))
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.EmptyZipCode", "Zip code cannot be empty."));
        }

        var trimmedZip = zipCode.Trim();
        if (trimmedZip.Length < MinZipCodeLength || trimmedZip.Length > MaxZipCodeLength)
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.InvalidZipCodeLength", $"Zip code must be between {MinZipCodeLength} and {MaxZipCodeLength} characters."));
        }

        if (!ZipCodeRegex().IsMatch(trimmedZip))
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.InvalidZipCodeFormat", "Zip code must contain only digits."));
        }

        if (string.IsNullOrWhiteSpace(country))
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.EmptyCountry", "Country cannot be empty."));
        }

        if (country.Trim().Length > MaxCountryLength)
        {
            return Result.Failure<Address>(
                DomainError.Validation("Address.CountryTooLong", $"Country cannot exceed {MaxCountryLength} characters."));
        }

        return new Address(
            street.Trim(),
            city.Trim(),
            trimmedZip,
            country.Trim());
    }

    protected override IEnumerable<object?> GetAtomicValues()
    {
        yield return Street;
        yield return City;
        yield return ZipCode;
        yield return Country;
    }

    [GeneratedRegex(@"^\d+$")]
    private static partial Regex ZipCodeRegex();
}
