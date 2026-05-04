using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ServiceBookAggregate.Errors;

public static class ServiceBookDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("ServiceRecord", id);

    public static readonly DomainError InvalidVehicleId =
        DomainError.Validation("ServiceRecord.InvalidVehicleId", "Service record must reference a vehicle.");

    public static readonly DomainError InvalidServiceDate =
        DomainError.Validation("ServiceRecord.InvalidServiceDate", "Service date cannot be in the future.");

    public static readonly DomainError InvalidMileage =
        DomainError.Validation("ServiceRecord.InvalidMileage", "Mileage at service must be zero or greater.");

    public static readonly DomainError InvalidCost =
        DomainError.Validation("ServiceRecord.InvalidCost", "Cost cannot be negative.");

    public static readonly DomainError DescriptionTooLong =
        DomainError.Validation("ServiceRecord.DescriptionTooLong", "Description exceeds maximum length.");

    public static readonly DomainError WorkshopNameTooLong =
        DomainError.Validation("ServiceRecord.WorkshopNameTooLong", "Workshop name exceeds maximum length.");

    public static readonly DomainError WorkshopContactTooLong =
        DomainError.Validation("ServiceRecord.WorkshopContactTooLong", "Workshop contact exceeds maximum length.");

    public static readonly DomainError MaxDocumentsReached =
        DomainError.Validation("ServiceRecord.MaxDocumentsReached", "Service record can have at most 10 documents.");

    public static readonly DomainError InvalidDocumentUrl =
        DomainError.Validation("ServiceRecord.InvalidDocumentUrl", "Document URL is required.");
}
