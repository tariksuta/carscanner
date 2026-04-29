using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Commands.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    Guid? BranchId = null) : ICommand<Result<CreateEmployeeCommandResult>>;

public sealed record CreateEmployeeCommandResult(Guid EmployeeId);
