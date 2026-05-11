using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Errors;

public static class MaintenanceReminderDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("MaintenanceReminder", id);

    public static readonly DomainError InvalidVehicleId =
        DomainError.Validation("MaintenanceReminder.InvalidVehicleId", "Reminder must reference a vehicle.");

    public static readonly DomainError InvalidDescription =
        DomainError.Validation("MaintenanceReminder.InvalidDescription", "Description is required.");

    public static readonly DomainError DescriptionTooLong =
        DomainError.Validation("MaintenanceReminder.DescriptionTooLong", "Description exceeds maximum length.");

    public static readonly DomainError NoTrigger =
        DomainError.Validation("MaintenanceReminder.NoTrigger", "Reminder must have a due date or due mileage.");

    public static readonly DomainError InvalidDueMileage =
        DomainError.Validation("MaintenanceReminder.InvalidDueMileage", "Due mileage must be greater than zero.");

    public static readonly DomainError AlreadyDismissed =
        DomainError.Validation("MaintenanceReminder.AlreadyDismissed", "Reminder is already dismissed.");
}
