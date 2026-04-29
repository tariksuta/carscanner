using CarScanner.Application.Authorization;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.SharedKernel.Authorization;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeePermissions;

public sealed class GetEmployeePermissionsQueryHandler(IEmployeeRepository employeeRepository)
    : IQueryHandler<GetEmployeePermissionsQuery, Result<IReadOnlyList<EmployeePermissionDto>>>
{
    public async Task<Result<IReadOnlyList<EmployeePermissionDto>>> Handle(
        GetEmployeePermissionsQuery request,
        CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee is null)
            return Result.Failure<IReadOnlyList<EmployeePermissionDto>>(
                EmployeeDomainErrors.NotFound(request.EmployeeId));

        var role = employee.ApplicationUser?.Role;
        var matrix = RolePermissionMatrix.ForRole(role);

        IReadOnlyList<EmployeePermissionDto> result = RolePermissionMatrix.AllModules
            .Select(module =>
            {
                var perm = matrix.TryGetValue(module, out var p) ? p : PermissionAction.None;
                return new EmployeePermissionDto(
                    Module: module.ToString(),
                    View: perm.HasFlag(PermissionAction.View),
                    Edit: perm.HasFlag(PermissionAction.Edit),
                    Delete: perm.HasFlag(PermissionAction.Delete));
            })
            .ToList();

        return Result.Success(result);
    }
}
