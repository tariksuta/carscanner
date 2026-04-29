using CarScanner.Domain.Aggregates.BranchAggregate;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.CreateBranch;

public sealed class CreateBranchCommandHandler(IBranchRepository branchRepository)
    : ICommandHandler<CreateBranchCommand, Result<CreateBranchCommandResult>>
{
    public Task<Result<CreateBranchCommandResult>> Handle(
        CreateBranchCommand request,
        CancellationToken cancellationToken)
    {
        var branchResult = Branch.Create(request.Name, request.City, request.Address);
        if (branchResult.IsFailure)
            return Task.FromResult(Result.Failure<CreateBranchCommandResult>(branchResult.Error));

        branchRepository.Add(branchResult.Value);

        return Task.FromResult<Result<CreateBranchCommandResult>>(
            new CreateBranchCommandResult(branchResult.Value.Id));
    }
}
