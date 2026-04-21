using CarScanner.Application.Features.Employees.Queries.GetEmployees;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeeById;

public sealed record GetEmployeeByIdQuery(Guid EmployeeId) : IQuery<Result<EmployeeDto>>;
