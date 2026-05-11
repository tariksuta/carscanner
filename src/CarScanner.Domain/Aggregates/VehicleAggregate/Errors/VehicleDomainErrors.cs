using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate.Errors;

public static class VehicleDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Vehicle", id);

    public static readonly DomainError AlreadyRented =
        new("Vehicle.AlreadyRented", "Vehicle is already rented and cannot be rented again.");

    public static readonly DomainError NotAvailable =
        new("Vehicle.NotAvailable", "Vehicle is not available for rental.");

    public static readonly DomainError InvalidBrand =
        DomainError.Validation("Vehicle.InvalidBrand", "Vehicle brand is required.");

    public static readonly DomainError InvalidModel =
        DomainError.Validation("Vehicle.InvalidModel", "Vehicle model is required.");

    public static readonly DomainError InvalidYear =
        DomainError.Validation("Vehicle.InvalidYear", "Vehicle year must be valid.");

    public static readonly DomainError InvalidVin =
        DomainError.Validation("Vehicle.InvalidVin", "Vehicle VIN must be 17 characters.");

    public static readonly DomainError InvalidPowerKw =
        DomainError.Validation("Vehicle.InvalidPowerKw", "Vehicle power (kW) must be greater than zero.");

    public static readonly DomainError InvalidSeats =
        DomainError.Validation("Vehicle.InvalidSeats", "Vehicle seats must be between 1 and 9.");

    public static readonly DomainError InvalidStatusTransition =
        DomainError.Validation("Vehicle.InvalidStatusTransition", "Requested status transition is not allowed.");

    public static readonly DomainError MaxImagesReached =
        DomainError.Validation("Vehicle.MaxImagesReached", "A vehicle can have a maximum of 10 images.");

    public static readonly DomainError InvalidImageUrl =
        DomainError.Validation("Vehicle.InvalidImageUrl", "Image URL cannot be empty.");

    public static DomainError ImageNotFound(Guid imageId) =>
        DomainError.NotFound("VehicleImage", imageId);

    public static DomainError InvalidImage(string reason) =>
        DomainError.Validation("Vehicle.InvalidImage", reason);
}
