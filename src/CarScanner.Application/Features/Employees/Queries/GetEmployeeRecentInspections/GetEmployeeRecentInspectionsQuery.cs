using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeeRecentInspections;

public sealed record GetEmployeeRecentInspectionsQuery(
    Guid EmployeeId,
    int Limit = 10) : IQuery<Result<IReadOnlyList<EmployeeRecentInspectionDto>>>;

public sealed record EmployeeRecentInspectionDto(
    Guid Id,
    string InspectionType,
    string Status,
    string VehicleBrand,
    string VehicleModel,
    DateTime CreatedOnUtc,
    DateTime? CompletedAt,
    double? DurationSeconds,
    bool HasDamage);
