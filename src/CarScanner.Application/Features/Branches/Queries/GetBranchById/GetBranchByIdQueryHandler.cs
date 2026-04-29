using CarScanner.Application.Features.Branches.Queries.GetBranches;
using CarScanner.Domain.Aggregates.BranchAggregate.Errors;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Queries.GetBranchById;

public sealed class GetBranchByIdQueryHandler(IBranchRepository branchRepository)
    : IQueryHandler<GetBranchByIdQuery, Result<BranchDto>>
{
    public async Task<Result<BranchDto>> Handle(
        GetBranchByIdQuery request,
        CancellationToken cancellationToken)
    {
        var branch = await branchRepository.GetByIdAsync(request.BranchId, cancellationToken);
        if (branch is null)
            return Result.Failure<BranchDto>(BranchDomainErrors.NotFound(request.BranchId));

        return new BranchDto(
            branch.Id,
            branch.Name,
            branch.City,
            branch.Address,
            branch.IsActive,
            branch.CreatedOnUtc,
            branch.ModifiedOnUtc);
    }
}
