using CarScanner.Application.Abstraction.Notifications;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.Notifications;

public sealed class ConsoleEmailNotificationService(ILogger<ConsoleEmailNotificationService> logger)
    : IEmailNotificationService
{
    public Task SendDamageReportNotificationAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string rentalInfo,
        int damageCount,
        decimal? totalEstimatedCost,
        string reportUrl,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            """
            ========== DAMAGE REPORT EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Damage Report for {VehicleInfo}

            Dear {RecipientName},

            A damage report has been generated for your recent rental.

            Vehicle: {VehicleInfo}
            Rental: {RentalInfo}
            Damages Found: {DamageCount}
            Estimated Cost: {TotalEstimatedCost:C}

            View full report: {ReportUrl}

            Best regards,
            CarScanner Team
            ==========================================
            """,
            recipientEmail,
            recipientName,
            vehicleInfo,
            recipientName,
            vehicleInfo,
            rentalInfo,
            damageCount,
            totalEstimatedCost,
            reportUrl);

        return Task.CompletedTask;
    }

    public Task SendRentalConfirmationAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateTime pickupDate,
        DateTime expectedReturnDate,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            """
            ========== RENTAL CONFIRMATION EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Rental Confirmation - {VehicleInfo}

            Dear {RecipientName},

            Your rental has been confirmed!

            Vehicle: {VehicleInfo}
            Pickup: {PickupDate}
            Expected Return: {ExpectedReturnDate}

            Best regards,
            CarScanner Team
            ===============================================
            """,
            recipientEmail,
            recipientName,
            vehicleInfo,
            recipientName,
            vehicleInfo,
            pickupDate,
            expectedReturnDate);

        return Task.CompletedTask;
    }

    public Task SendRentalCompletionAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateTime returnDate,
        bool hasDamages,
        CancellationToken cancellationToken = default)
    {
        var damageStatus = hasDamages
            ? "Damages were detected. A separate report will be sent."
            : "No damages were found. Thank you for returning the vehicle in good condition!";

        logger.LogInformation(
            """
            ========== RENTAL COMPLETION EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Rental Completed - {VehicleInfo}

            Dear {RecipientName},

            Your rental has been completed!

            Vehicle: {VehicleInfo}
            Returned: {ReturnDate}

            {DamageStatus}

            Best regards,
            CarScanner Team
            =============================================
            """,
            recipientEmail,
            recipientName,
            vehicleInfo,
            recipientName,
            vehicleInfo,
            returnDate,
            damageStatus);

        return Task.CompletedTask;
    }

    public Task SendEmployeeWelcomeAsync(
        string recipientEmail,
        string recipientName,
        string temporaryPassword,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            """
            ========== EMPLOYEE WELCOME EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Dobrodošli u CarScanner

            Poštovani {RecipientName},

            Vaš korisnički nalog je kreiran.

            Email: {RecipientEmail}
            Privremena lozinka: {TemporaryPassword}

            Preporučuje se da promijenite lozinku pri prvoj prijavi.

            Srdačan pozdrav,
            CarScanner Team
            ============================================
            """,
            recipientEmail,
            recipientName,
            recipientName,
            recipientEmail,
            temporaryPassword);

        return Task.CompletedTask;
    }
}
