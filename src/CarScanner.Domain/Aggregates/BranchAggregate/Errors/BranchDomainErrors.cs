using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BranchAggregate.Errors;

public static class BranchDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Branch", id);

    public static readonly DomainError InvalidName =
        DomainError.Validation("Branch.InvalidName", "Branch name is required.");

    public static readonly DomainError InvalidCity =
        DomainError.Validation("Branch.InvalidCity", "City is required.");

    public static readonly DomainError NameTooLong =
        DomainError.Validation("Branch.NameTooLong", "Branch name cannot exceed 100 characters.");

    public static readonly DomainError CityTooLong =
        DomainError.Validation("Branch.CityTooLong", "City cannot exceed 100 characters.");

    public static readonly DomainError AddressTooLong =
        DomainError.Validation("Branch.AddressTooLong", "Address cannot exceed 500 characters.");
}
