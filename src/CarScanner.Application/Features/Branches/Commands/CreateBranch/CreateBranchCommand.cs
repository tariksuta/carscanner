using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.CreateBranch;

public sealed record CreateBranchCommand(
    string Name,
    string City,
    string? Address) : ICommand<Result<CreateBranchCommandResult>>;

public sealed record CreateBranchCommandResult(Guid BranchId);
