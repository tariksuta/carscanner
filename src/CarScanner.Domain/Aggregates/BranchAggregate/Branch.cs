using CarScanner.Domain.Aggregates.BranchAggregate.Errors;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BranchAggregate;

public sealed class Branch : AggregateRoot, ITenantEntity
{
    public const int MaxNameLength = 100;
    public const int MaxCityLength = 100;
    public const int MaxAddressLength = 500;

    public Guid TenantId { get; set; }
    public string Name { get; private set; } = null!;
    public string City { get; private set; } = null!;
    public string? Address { get; private set; }
    public bool IsActive { get; private set; }

    public string DisplayLabel => $"{City} · {Name}";

    private Branch() { }

    private Branch(string name, string city, string? address) : base()
    {
        Name = name;
        City = city;
        Address = address;
        IsActive = true;
    }

    public static Result<Branch> Create(string name, string city, string? address)
    {
        var validation = Validate(name, city, address);
        if (validation.IsFailure)
            return Result.Failure<Branch>(validation.Error);

        return new Branch(
            name.Trim(),
            city.Trim(),
            string.IsNullOrWhiteSpace(address) ? null : address.Trim());
    }

    public Result Update(string name, string city, string? address)
    {
        var validation = Validate(name, city, address);
        if (validation.IsFailure)
            return validation;

        Name = name.Trim();
        City = city.Trim();
        Address = string.IsNullOrWhiteSpace(address) ? null : address.Trim();

        return Result.Success();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    private static Result Validate(string name, string city, string? address)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(BranchDomainErrors.InvalidName);

        if (name.Trim().Length > MaxNameLength)
            return Result.Failure(BranchDomainErrors.NameTooLong);

        if (string.IsNullOrWhiteSpace(city))
            return Result.Failure(BranchDomainErrors.InvalidCity);

        if (city.Trim().Length > MaxCityLength)
            return Result.Failure(BranchDomainErrors.CityTooLong);

        if (!string.IsNullOrWhiteSpace(address) && address.Trim().Length > MaxAddressLength)
            return Result.Failure(BranchDomainErrors.AddressTooLong);

        return Result.Success();
    }
}
