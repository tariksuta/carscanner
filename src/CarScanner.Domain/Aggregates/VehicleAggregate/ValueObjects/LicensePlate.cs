using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.ValueObjects;

public sealed class LicensePlate : ValueObject
{
    public string Value { get; }

    private LicensePlate(string value)
    {
        Value = value;
    }

    public static Result<LicensePlate> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result.Failure<LicensePlate>(
                DomainError.Validation("LicensePlate.Empty", "License plate cannot be empty."));
        }

        var trimmedValue = value.Trim().ToUpperInvariant();

        if (trimmedValue.Length < 2 || trimmedValue.Length > 15)
        {
            return Result.Failure<LicensePlate>(
                DomainError.Validation("LicensePlate.InvalidLength", "License plate must be between 2 and 15 characters."));
        }

        return new LicensePlate(trimmedValue);
    }

    protected override IEnumerable<object?> GetAtomicValues()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
