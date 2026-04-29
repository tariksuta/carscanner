using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Employees.Queries.GetEmployeeStats;

public sealed record GetEmployeeStatsQuery(Guid EmployeeId)
    : IQuery<Result<EmployeeStatsDto>>;

public sealed record EmployeeStatsDto(
    int TotalInspections,
    int InspectionsThisMonth,
    int InspectionsLastMonth,
    double? MonthOverMonthChangePercent,
    double? AverageDurationSeconds,
    double? TeamAverageDurationSeconds,
    int CompletedInspections,
    double? CompletedRatePercent,
    int ReturnInspectionsCompleted,
    int DamageDetectionsCount,
    double? DamageDetectionRatePercent);
