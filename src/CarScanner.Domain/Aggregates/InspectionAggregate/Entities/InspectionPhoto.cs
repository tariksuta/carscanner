using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.InspectionAggregate.Entities;

public sealed class InspectionPhoto : Entity<Guid>
{
    public Guid InspectionId { get; private set; }
    public PhotoPosition Position { get; private set; }
    public string PhotoUrl { get; private set; } = null!;
    public DateTime TakenAt { get; private set; }

    private InspectionPhoto() { }

    internal InspectionPhoto(
        Guid inspectionId,
        PhotoPosition position,
        string photoUrl) : base(Guid.NewGuid())
    {
        InspectionId = inspectionId;
        Position = position;
        PhotoUrl = photoUrl;
        TakenAt = DateTime.UtcNow;
    }

    internal void UpdatePhotoUrl(string newUrl)
    {
        PhotoUrl = newUrl;
        TakenAt = DateTime.UtcNow;
    }
}
