using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Errors;

public static class DamageReportDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("DamageReport", id);

    public static readonly DomainError AlreadyAnalyzing =
        new("DamageReport.AlreadyAnalyzing", "Damage analysis is already in progress.");

    public static readonly DomainError AlreadyCompleted =
        new("DamageReport.AlreadyCompleted", "Damage analysis has already been completed.");

    public static readonly DomainError NotAnalyzing =
        new("DamageReport.NotAnalyzing", "Cannot complete analysis that is not in progress.");

    public static readonly DomainError AnalysisFailed =
        new("DamageReport.AnalysisFailed", "Damage analysis failed. Please try again.");
}
