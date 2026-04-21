using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.DamageReportAggregate.Entities;

public sealed class DamageItem : Entity<Guid>
{
    public Guid DamageReportId { get; private set; }
    public PhotoPosition Position { get; private set; }
    public string Description { get; private set; } = null!;
    public DamageSeverity Severity { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public string? PickupPhotoUrl { get; private set; }
    public string? ReturnPhotoUrl { get; private set; }

    private DamageItem() { }

    internal DamageItem(
        Guid damageReportId,
        PhotoPosition position,
        string description,
        DamageSeverity severity,
        decimal? estimatedCost,
        string? pickupPhotoUrl,
        string? returnPhotoUrl) : base(Guid.NewGuid())
    {
        DamageReportId = damageReportId;
        Position = position;
        Description = description;
        Severity = severity;
        EstimatedCost = estimatedCost;
        PickupPhotoUrl = pickupPhotoUrl;
        ReturnPhotoUrl = returnPhotoUrl;
    }

    internal void UpdateEstimatedCost(decimal cost)
    {
        EstimatedCost = cost;
    }
}
