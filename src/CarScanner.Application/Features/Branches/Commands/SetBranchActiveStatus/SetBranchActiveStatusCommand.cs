using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Commands.SetBranchActiveStatus;

public sealed record SetBranchActiveStatusCommand(
    Guid BranchId,
    bool IsActive) : ICommand<Result>;
