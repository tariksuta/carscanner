using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.InspectionAggregate.Errors;

public static class InspectionDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("VehicleInspection", id);

    public static readonly DomainError AlreadyCompleted =
        new("Inspection.AlreadyCompleted", "The inspection has already been completed.");

    public static readonly DomainError MissingPhotos =
        new("Inspection.MissingPhotos", "All four photos (Front, Back, Left, Right) must be uploaded before completing the inspection.");

    public static readonly DomainError DuplicatePhotoPosition =
        new("Inspection.DuplicatePhotoPosition", "A photo for this position has already been uploaded.");

    public static readonly DomainError InvalidPhotoUrl =
        DomainError.Validation("Inspection.InvalidPhotoUrl", "Photo URL is required.");

    public static readonly DomainError CannotModifyCompletedInspection =
        new("Inspection.CannotModify", "Cannot modify a completed inspection.");
}
