using CarScanner.Domain.Aggregates.BranchAggregate.Errors;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.SetBranchActiveStatus;

public sealed class SetBranchActiveStatusCommandHandler(IBranchRepository branchRepository)
    : ICommandHandler<SetBranchActiveStatusCommand, Result>
{
    public async Task<Result> Handle(
        SetBranchActiveStatusCommand request,
        CancellationToken cancellationToken)
    {
        var branch = await branchRepository.GetByIdAsync(request.BranchId, cancellationToken);
        if (branch is null)
            return Result.Failure(BranchDomainErrors.NotFound(request.BranchId));

        if (request.IsActive)
            branch.Activate();
        else
            branch.Deactivate();

        return Result.Success();
    }
}
