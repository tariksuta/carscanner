using CarScanner.Domain.Aggregates.BranchAggregate.Errors;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.UpdateBranch;

public sealed class UpdateBranchCommandHandler(IBranchRepository branchRepository)
    : ICommandHandler<UpdateBranchCommand, Result>
{
    public async Task<Result> Handle(
        UpdateBranchCommand request,
        CancellationToken cancellationToken)
    {
        var branch = await branchRepository.GetByIdAsync(request.BranchId, cancellationToken);
        if (branch is null)
            return Result.Failure(BranchDomainErrors.NotFound(request.BranchId));

        return branch.Update(request.Name, request.City, request.Address);
    }
}
