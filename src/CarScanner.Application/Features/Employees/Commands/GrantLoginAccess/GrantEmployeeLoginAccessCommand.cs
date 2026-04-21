using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Commands.GrantLoginAccess;

public sealed record GrantEmployeeLoginAccessCommand(
    Guid EmployeeId,
    string? Role) : ICommand<Result<GrantEmployeeLoginAccessCommandResult>>;

public sealed record GrantEmployeeLoginAccessCommandResult(Guid ApplicationUserId);
