namespace CarScanner.Application.Abstraction.Notifications;

public interface IEmailNotificationService
{
    Task SendDamageReportNotificationAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string rentalInfo,
        int damageCount,
        decimal? totalEstimatedCost,
        string reportUrl,
        CancellationToken cancellationToken = default);

    Task SendRentalConfirmationAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateTime pickupDate,
        DateTime expectedReturnDate,
        CancellationToken cancellationToken = default);

    Task SendRentalCompletionAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateTime returnDate,
        bool hasDamages,
        CancellationToken cancellationToken = default);

    Task SendEmployeeWelcomeAsync(
        string recipientEmail,
        string recipientName,
        string temporaryPassword,
        CancellationToken cancellationToken = default);

    Task SendLowBalanceAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal balance,
        decimal threshold,
        string currency,
        CancellationToken cancellationToken = default);

    Task SendBalanceExhaustedAlertAsync(
        string recipientEmail,
        string recipientName,
        string currency,
        CancellationToken cancellationToken = default);

    Task SendMonthlyCapReachedAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal monthSpent,
        decimal cap,
        string currency,
        CancellationToken cancellationToken = default);

    Task SendRegistrationExpiryReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateOnly dueDate,
        int daysUntilDue,
        CancellationToken cancellationToken = default);

    Task SendInsuranceExpiryReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateOnly dueDate,
        int daysUntilDue,
        CancellationToken cancellationToken = default);

    Task SendServiceDueReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string description,
        DateOnly? dueDate,
        int? dueMileage,
        int? currentMileage,
        CancellationToken cancellationToken = default);

    Task SendCustomReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string title,
        string description,
        DateOnly? dueDate,
        CancellationToken cancellationToken = default);
}
