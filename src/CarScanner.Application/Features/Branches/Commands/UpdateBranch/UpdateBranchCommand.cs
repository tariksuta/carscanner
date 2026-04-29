using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.UpdateBranch;

public sealed record UpdateBranchCommand(
    Guid BranchId,
    string Name,
    string City,
    string? Address) : ICommand<Result>;
