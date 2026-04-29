using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeeRecentInspections;

public sealed class GetEmployeeRecentInspectionsQueryHandler(
    IEmployeeRepository employeeRepository,
    IVehicleInspectionRepository inspectionRepository,
    IVehicleRepository vehicleRepository,
    IDamageReportRepository damageReportRepository)
    : IQueryHandler<GetEmployeeRecentInspectionsQuery, Result<IReadOnlyList<EmployeeRecentInspectionDto>>>
{
    public async Task<Result<IReadOnlyList<EmployeeRecentInspectionDto>>> Handle(
        GetEmployeeRecentInspectionsQuery request,
        CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee is null)
            return Result.Failure<IReadOnlyList<EmployeeRecentInspectionDto>>(
                EmployeeDomainErrors.NotFound(request.EmployeeId));

        var limit = Math.Clamp(request.Limit, 1, 50);

        var inspections = await inspectionRepository.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);

        var recent = inspections
            .OrderByDescending(i => i.CompletedAt ?? i.CreatedOnUtc)
            .Take(limit)
            .ToList();

        if (recent.Count == 0)
            return Result.Success<IReadOnlyList<EmployeeRecentInspectionDto>>([]);

        var vehicleIds = recent.Select(i => i.VehicleId).ToHashSet();
        var allVehicles = await vehicleRepository.GetAllAsync(cancellationToken);
        var vehiclesById = allVehicles
            .Where(v => vehicleIds.Contains(v.Id))
            .ToDictionary(v => v.Id);

        var inspectionIds = recent.Select(i => i.Id).ToHashSet();
        var damageReports = await damageReportRepository.GetAllAsync(cancellationToken);
        var damageInspectionIds = damageReports
            .Where(r => r.DamageItems.Count > 0)
            .SelectMany(r => new[] { r.PickupInspectionId, r.ReturnInspectionId })
            .Where(id => inspectionIds.Contains(id))
            .ToHashSet();

        IReadOnlyList<EmployeeRecentInspectionDto> result = recent
            .Select(i =>
            {
                vehiclesById.TryGetValue(i.VehicleId, out var vehicle);
                double? durationSeconds = null;
                if (i.CompletedAt is { } completedAt)
                {
                    durationSeconds = Math.Max(0, (completedAt - i.CreatedOnUtc).TotalSeconds);
                }

                return new EmployeeRecentInspectionDto(
                    Id: i.Id,
                    InspectionType: i.InspectionType.ToString(),
                    Status: i.Status.ToString(),
                    VehicleBrand: vehicle?.Brand ?? "—",
                    VehicleModel: vehicle?.Model ?? string.Empty,
                    CreatedOnUtc: i.CreatedOnUtc,
                    CompletedAt: i.CompletedAt,
                    DurationSeconds: durationSeconds,
                    HasDamage: damageInspectionIds.Contains(i.Id));
            })
            .ToList();

        return Result.Success(result);
    }
}
