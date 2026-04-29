using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Commands.UpdateEmployee;

public sealed record UpdateEmployeeCommand(
    Guid EmployeeId,
    string FirstName,
    string LastName,
    string? Phone,
    Guid? BranchId = null) : ICommand<Result>;
