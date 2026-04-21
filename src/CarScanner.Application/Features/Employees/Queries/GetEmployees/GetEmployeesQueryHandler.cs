using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployees;

public sealed class GetEmployeesQueryHandler(IEmployeeRepository employeeRepository)
    : IQueryHandler<GetEmployeesQuery, Result<PagedResult<EmployeeDto>>>
{
    public async Task<Result<PagedResult<EmployeeDto>>> Handle(
        GetEmployeesQuery request,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.GetAllAsync(cancellationToken);

        var query = employees.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(e =>
                e.FirstName.ToLowerInvariant().Contains(search) ||
                e.LastName.ToLowerInvariant().Contains(search) ||
                e.Email.ToLowerInvariant().Contains(search));
        }

        var filtered = query.ToList();
        var totalCount = filtered.Count;

        var items = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EmployeeDto(
                e.Id,
                e.FirstName,
                e.LastName,
                e.Email,
                e.Phone,
                e.IsActive,
                e.CreatedOnUtc,
                e.ModifiedOnUtc))
            .ToList();

        return new PagedResult<EmployeeDto>(items, request.Page, request.PageSize, totalCount);
    }
}
