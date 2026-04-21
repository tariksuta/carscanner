using CarScanner.Domain.Aggregates.InspectionAggregate.Entities;
using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.InspectionAggregate;

public sealed class VehicleInspection : AggregateRoot, ITenantEntity
{
    private readonly List<InspectionPhoto> _photos = [];

    public Guid TenantId { get; set; }
    public Guid RentalId { get; private set; }
    public Guid VehicleId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public InspectionType InspectionType { get; private set; }
    public InspectionStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? Notes { get; private set; }

    public IReadOnlyCollection<InspectionPhoto> Photos => _photos.AsReadOnly();

    private VehicleInspection() { }

    private VehicleInspection(
        Guid rentalId,
        Guid vehicleId,
        Guid employeeId,
        InspectionType inspectionType) : base()
    {
        RentalId = rentalId;
        VehicleId = vehicleId;
        EmployeeId = employeeId;
        InspectionType = inspectionType;
        Status = InspectionStatus.InProgress;
    }

    public static Result<VehicleInspection> Create(
        Guid rentalId,
        Guid vehicleId,
        Guid employeeId,
        InspectionType inspectionType)
    {
        var inspection = new VehicleInspection(rentalId, vehicleId, employeeId, inspectionType);

        inspection.RaiseDomainEvent(new InspectionCreatedDomainEvent(
            inspection.Id,
            rentalId,
            vehicleId,
            inspectionType));

        return inspection;
    }

    public Result AddPhoto(PhotoPosition position, string photoUrl)
    {
        if (Status == InspectionStatus.Completed)
            return Result.Failure(InspectionDomainErrors.CannotModifyCompletedInspection);

        if (string.IsNullOrWhiteSpace(photoUrl))
            return Result.Failure(InspectionDomainErrors.InvalidPhotoUrl);

        var existingPhoto = _photos.FirstOrDefault(p => p.Position == position);
        if (existingPhoto is not null)
        {
            existingPhoto.UpdatePhotoUrl(photoUrl);
        }
        else
        {
            _photos.Add(new InspectionPhoto(Id, position, photoUrl));
        }

        if (_photos.Count == 4)
        {
            Status = InspectionStatus.PhotosUploaded;
        }
        else
        {
            Status = InspectionStatus.InProgress;
        }

        return Result.Success();
    }

    public Result Complete()
    {
        if (Status == InspectionStatus.Completed)
            return Result.Failure(InspectionDomainErrors.AlreadyCompleted);

        if (!HasAllRequiredPhotos())
            return Result.Failure(InspectionDomainErrors.MissingPhotos);

        Status = InspectionStatus.Completed;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new InspectionCompletedDomainEvent(
            Id,
            RentalId,
            VehicleId,
            InspectionType));

        return Result.Success();
    }

    public bool HasAllRequiredPhotos()
    {
        var requiredPositions = new[]
        {
            PhotoPosition.Front,
            PhotoPosition.Back,
            PhotoPosition.LeftSide,
            PhotoPosition.RightSide
        };

        return requiredPositions.All(pos => _photos.Any(p => p.Position == pos));
    }

    public InspectionPhoto? GetPhotoByPosition(PhotoPosition position)
    {
        return _photos.FirstOrDefault(p => p.Position == position);
    }

    public void AddNote(string note)
    {
        Notes = string.IsNullOrWhiteSpace(Notes)
            ? note
            : $"{Notes}\n{note}";
    }
}
