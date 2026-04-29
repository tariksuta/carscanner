using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.RentalAggregate.Errors;

public static class RentalDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("Rental", id);

    public static readonly DomainError VehicleNotAvailable =
        new("Rental.VehicleNotAvailable", "The vehicle is not available for rental.");

    public static readonly DomainError ClientCannotRent =
        new("Rental.ClientCannotRent", "The client is not eligible to rent (driver license may be expired).");

    public static readonly DomainError AlreadyStarted =
        new("Rental.AlreadyStarted", "The rental has already been started.");

    public static readonly DomainError NotStarted =
        new("Rental.NotStarted", "The rental has not been started yet.");

    public static readonly DomainError AlreadyCompleted =
        new("Rental.AlreadyCompleted", "The rental has already been completed.");

    public static readonly DomainError AlreadyCancelled =
        new("Rental.AlreadyCancelled", "The rental has been cancelled.");

    public static readonly DomainError InvalidReturnDate =
        new("Rental.InvalidReturnDate", "Expected return date must be after pickup date.");

    public static readonly DomainError InvalidPrice =
        new("Rental.InvalidPrice", "Price must be greater than or equal to zero.");

    public static readonly DomainError PickupInspectionRequired =
        new("Rental.PickupInspectionRequired", "Pickup inspection must be completed before starting the rental.");

    public static readonly DomainError ReturnInspectionRequired =
        new("Rental.ReturnInspectionRequired", "Return inspection must be completed before completing the rental.");

    public static readonly DomainError CannotCancel =
        new("Rental.CannotCancel", "This rental cannot be cancelled in its current state.");

    public static readonly DomainError InvalidStatusTransition =
        new("Rental.InvalidStatusTransition", "The requested status transition is not valid.");

    public static readonly DomainError EmployeeRequired =
        new("Rental.EmployeeRequired", "An employee must be assigned for this status transition.");
}
