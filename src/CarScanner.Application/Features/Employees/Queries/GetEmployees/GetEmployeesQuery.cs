using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployees;

public sealed record GetEmployeesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null) : IQuery<Result<PagedResult<EmployeeDto>>>;

public sealed record EmployeeDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    bool IsActive,
    DateTime CreatedOnUtc,
    DateTime? ModifiedOnUtc);
