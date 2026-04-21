using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.Entities;

public sealed class VehicleImage : Entity<Guid>
{
    public Guid VehicleId { get; private set; }
    public string ImageUrl { get; private set; } = null!;
    public bool IsPrimary { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime UploadedAt { get; private set; }

    private VehicleImage() { }

    internal VehicleImage(
        Guid vehicleId,
        string imageUrl,
        bool isPrimary,
        int displayOrder) : base(Guid.NewGuid())
    {
        VehicleId = vehicleId;
        ImageUrl = imageUrl;
        IsPrimary = isPrimary;
        DisplayOrder = displayOrder;
        UploadedAt = DateTime.UtcNow;
    }

    internal void SetAsPrimary(bool isPrimary)
    {
        IsPrimary = isPrimary;
    }

    internal void UpdateDisplayOrder(int order)
    {
        DisplayOrder = order;
    }
}
