using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Queries.GetBranches;

public sealed class GetBranchesQueryHandler(IBranchRepository branchRepository)
    : IQueryHandler<GetBranchesQuery, Result<IReadOnlyList<BranchDto>>>
{
    public async Task<Result<IReadOnlyList<BranchDto>>> Handle(
        GetBranchesQuery request,
        CancellationToken cancellationToken)
    {
        var branches = request.ActiveOnly
            ? await branchRepository.GetActiveAsync(cancellationToken)
            : await branchRepository.GetAllAsync(cancellationToken);

        IReadOnlyList<BranchDto> items = branches
            .Select(b => new BranchDto(
                b.Id,
                b.Name,
                b.City,
                b.Address,
                b.IsActive,
                b.CreatedOnUtc,
                b.ModifiedOnUtc))
            .ToList();

        return Result.Success(items);
    }
}
