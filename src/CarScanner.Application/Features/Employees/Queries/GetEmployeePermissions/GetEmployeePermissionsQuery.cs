using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeePermissions;

public sealed record GetEmployeePermissionsQuery(Guid EmployeeId)
    : IQuery<Result<IReadOnlyList<EmployeePermissionDto>>>;

public sealed record EmployeePermissionDto(
    string Module,
    bool View,
    bool Edit,
    bool Delete);
