using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Queries.GetBranches;

public sealed record GetBranchesQuery(
    bool ActiveOnly = false) : IQuery<Result<IReadOnlyList<BranchDto>>>;

public sealed record BranchDto(
    Guid Id,
    string Name,
    string City,
    string? Address,
    bool IsActive,
    DateTime CreatedOnUtc,
    DateTime? ModifiedOnUtc);
