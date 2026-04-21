using CarScanner.Domain.Aggregates.EmployeeAggregate;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Commands.CreateEmployee;

public sealed class CreateEmployeeCommandHandler(IEmployeeRepository employeeRepository)
    : ICommandHandler<CreateEmployeeCommand, Result<CreateEmployeeCommandResult>>
{
    public async Task<Result<CreateEmployeeCommandResult>> Handle(
        CreateEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        var existingEmployee = await employeeRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmployee is not null)
        {
            return Result.Failure<CreateEmployeeCommandResult>(EmployeeDomainErrors.EmailAlreadyExists);
        }

        var employeeResult = Employee.Create(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone);

        if (employeeResult.IsFailure)
            return Result.Failure<CreateEmployeeCommandResult>(employeeResult.Error);

        employeeRepository.Add(employeeResult.Value);

        return new CreateEmployeeCommandResult(employeeResult.Value.Id);
    }
}
