using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeeStats;

public sealed class GetEmployeeStatsQueryHandler(
    IEmployeeRepository employeeRepository,
    IVehicleInspectionRepository inspectionRepository,
    IDamageReportRepository damageReportRepository)
    : IQueryHandler<GetEmployeeStatsQuery, Result<EmployeeStatsDto>>
{
    public async Task<Result<EmployeeStatsDto>> Handle(
        GetEmployeeStatsQuery request,
        CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee is null)
            return Result.Failure<EmployeeStatsDto>(EmployeeDomainErrors.NotFound(request.EmployeeId));

        var employeeInspections = await inspectionRepository.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
        var allInspections = await inspectionRepository.GetAllAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfThisMonth.AddMonths(-1);

        var totalInspections = employeeInspections.Count;
        var thisMonth = employeeInspections.Count(i => i.CreatedOnUtc >= startOfThisMonth);
        var lastMonth = employeeInspections.Count(i =>
            i.CreatedOnUtc >= startOfLastMonth && i.CreatedOnUtc < startOfThisMonth);

        double? momChange = lastMonth == 0
            ? (thisMonth > 0 ? 100d : (double?)null)
            : Math.Round(((thisMonth - lastMonth) / (double)lastMonth) * 100d, 1);

        var employeeCompleted = employeeInspections
            .Where(i => i.Status == InspectionStatus.Completed && i.CompletedAt.HasValue)
            .ToList();

        double? avgDurationSeconds = employeeCompleted.Count == 0
            ? null
            : Math.Round(employeeCompleted.Average(i => DurationSeconds(i)), 0);

        var teamCompleted = allInspections
            .Where(i => i.Status == InspectionStatus.Completed && i.CompletedAt.HasValue)
            .ToList();

        double? teamAvgDurationSeconds = teamCompleted.Count == 0
            ? null
            : Math.Round(teamCompleted.Average(i => DurationSeconds(i)), 0);

        double? completedRate = totalInspections == 0
            ? null
            : Math.Round((employeeCompleted.Count / (double)totalInspections) * 100d, 1);

        var returnInspectionIds = employeeInspections
            .Where(i => i.InspectionType == InspectionType.Return && i.Status == InspectionStatus.Completed)
            .Select(i => i.Id)
            .ToHashSet();

        int damageDetections = 0;
        if (returnInspectionIds.Count > 0)
        {
            var damageReports = await damageReportRepository.GetAllAsync(cancellationToken);
            damageDetections = damageReports.Count(r =>
                returnInspectionIds.Contains(r.ReturnInspectionId) &&
                r.DamageItems.Count > 0);
        }

        double? damageDetectionRate = returnInspectionIds.Count == 0
            ? null
            : Math.Round((damageDetections / (double)returnInspectionIds.Count) * 100d, 1);

        var dto = new EmployeeStatsDto(
            TotalInspections: totalInspections,
            InspectionsThisMonth: thisMonth,
            InspectionsLastMonth: lastMonth,
            MonthOverMonthChangePercent: momChange,
            AverageDurationSeconds: avgDurationSeconds,
            TeamAverageDurationSeconds: teamAvgDurationSeconds,
            CompletedInspections: employeeCompleted.Count,
            CompletedRatePercent: completedRate,
            ReturnInspectionsCompleted: returnInspectionIds.Count,
            DamageDetectionsCount: damageDetections,
            DamageDetectionRatePercent: damageDetectionRate);

        return Result.Success(dto);
    }

    private static double DurationSeconds(VehicleInspection i)
    {
        var completed = i.CompletedAt!.Value;
        return Math.Max(0, (completed - i.CreatedOnUtc).TotalSeconds);
    }
}
