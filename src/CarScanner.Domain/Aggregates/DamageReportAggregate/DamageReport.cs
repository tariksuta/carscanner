using CarScanner.Domain.Aggregates.DamageReportAggregate.Entities;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Errors;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate;

public sealed class DamageReport : AggregateRoot, ITenantEntity
{
    private readonly List<DamageItem> _damageItems = [];

    public Guid TenantId { get; set; }
    public Guid RentalId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid PickupInspectionId { get; private set; }
    public Guid ReturnInspectionId { get; private set; }
    public DamageReportStatus Status { get; private set; }
    public DateTime RequestedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? AiRawResponse { get; private set; }
    public string? ErrorMessage { get; private set; }

    public IReadOnlyCollection<DamageItem> DamageItems => _damageItems.AsReadOnly();

    public bool HasDamages => _damageItems.Count > 0;

    public decimal? TotalEstimatedCost => _damageItems
        .Where(d => d.EstimatedCost.HasValue)
        .Sum(d => d.EstimatedCost);

    private DamageReport() { }

    private DamageReport(
        Guid rentalId,
        Guid clientId,
        Guid pickupInspectionId,
        Guid returnInspectionId) : base()
    {
        RentalId = rentalId;
        ClientId = clientId;
        PickupInspectionId = pickupInspectionId;
        ReturnInspectionId = returnInspectionId;
        Status = DamageReportStatus.Pending;
        RequestedAt = DateTime.UtcNow;
    }

    public static Result<DamageReport> Create(
        Guid rentalId,
        Guid clientId,
        Guid pickupInspectionId,
        Guid returnInspectionId)
    {
        var report = new DamageReport(rentalId, clientId, pickupInspectionId, returnInspectionId);

        report.RaiseDomainEvent(new DamageAnalysisRequestedDomainEvent(
            report.Id,
            rentalId,
            pickupInspectionId,
            returnInspectionId));

        return report;
    }

    public Result StartAnalysis()
    {
        if (Status == DamageReportStatus.Analyzing)
            return Result.Failure(DamageReportDomainErrors.AlreadyAnalyzing);

        if (Status is DamageReportStatus.Completed or DamageReportStatus.NoDamageFound or DamageReportStatus.DamageDetected)
            return Result.Failure(DamageReportDomainErrors.AlreadyCompleted);

        Status = DamageReportStatus.Analyzing;
        return Result.Success();
    }

    public Result CompleteWithNoDamage(string? aiResponse)
    {
        if (Status != DamageReportStatus.Analyzing)
            return Result.Failure(DamageReportDomainErrors.NotAnalyzing);

        AiRawResponse = aiResponse;
        Status = DamageReportStatus.NoDamageFound;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new DamageAnalysisCompletedDomainEvent(Id, RentalId, false));

        return Result.Success();
    }

    public Result AddDamageItem(
        PhotoPosition position,
        string description,
        DamageSeverity severity,
        decimal? estimatedCost,
        string? pickupPhotoUrl,
        string? returnPhotoUrl)
    {
        if (Status != DamageReportStatus.Analyzing)
            return Result.Failure(DamageReportDomainErrors.NotAnalyzing);

        _damageItems.Add(new DamageItem(
            Id,
            position,
            description,
            severity,
            estimatedCost,
            pickupPhotoUrl,
            returnPhotoUrl));

        return Result.Success();
    }

    public Result CompleteWithDamages(string? aiResponse)
    {
        if (Status != DamageReportStatus.Analyzing)
            return Result.Failure(DamageReportDomainErrors.NotAnalyzing);

        AiRawResponse = aiResponse;
        Status = DamageReportStatus.DamageDetected;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new DamageAnalysisCompletedDomainEvent(Id, RentalId, true));
        RaiseDomainEvent(new DamageDetectedDomainEvent(
            Id,
            RentalId,
            ClientId,
            _damageItems.Count,
            TotalEstimatedCost));

        return Result.Success();
    }

    public Result MarkAsFailed(string errorMessage)
    {
        Status = DamageReportStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Retry()
    {
        if (Status != DamageReportStatus.Failed)
            return Result.Failure(DamageReportDomainErrors.AlreadyCompleted);

        _damageItems.Clear();
        Status = DamageReportStatus.Pending;
        AiRawResponse = null;
        ErrorMessage = null;
        CompletedAt = null;
        RequestedAt = DateTime.UtcNow;

        RaiseDomainEvent(new DamageAnalysisRequestedDomainEvent(
            Id,
            RentalId,
            PickupInspectionId,
            ReturnInspectionId));

        return Result.Success();
    }
}
