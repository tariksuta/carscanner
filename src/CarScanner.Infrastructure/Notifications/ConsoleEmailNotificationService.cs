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

    public Task SendLowBalanceAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal balance,
        decimal threshold,
        string currency,
        CancellationToken cancellationToken = default)
    {
        logger.LogWarning(
            """
            ========== LOW BALANCE ALERT EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Upozorenje: nizak balans

            Poštovani {RecipientName},

            Vaš AI kredit je pao ispod podešenog praga.

            Trenutni balans: {Balance} {Currency}
            Prag upozorenja: {Threshold} {Currency}

            Preporučujemo da dopunite kredit kako biste izbjegli prekid AI analiza.

            Srdačan pozdrav,
            CarScanner Team
            =============================================
            """,
            recipientEmail,
            recipientName,
            recipientName,
            balance,
            currency,
            threshold,
            currency);

        return Task.CompletedTask;
    }

    public Task SendBalanceExhaustedAlertAsync(
        string recipientEmail,
        string recipientName,
        string currency,
        CancellationToken cancellationToken = default)
    {
        logger.LogWarning(
            """
            ========== BALANCE EXHAUSTED EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: AI servis pauziran — balans je iscrpljen

            Poštovani {RecipientName},

            Vaš AI kredit je iscrpljen ({Currency}). AI analiza je trenutno pauzirana
            za vaš nalog. Dopunite balans kako biste nastavili.

            Srdačan pozdrav,
            CarScanner Team
            =============================================
            """,
            recipientEmail,
            recipientName,
            recipientName,
            currency);

        return Task.CompletedTask;
    }

    public Task SendMonthlyCapReachedAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal monthSpent,
        decimal cap,
        string currency,
        CancellationToken cancellationToken = default)
    {
        logger.LogWarning(
            """
            ========== MONTHLY CAP REACHED EMAIL ==========
            To: {RecipientEmail} ({RecipientName})
            Subject: Mjesečni limit dostignut

            Poštovani {RecipientName},

            Dostigli ste podešeni mjesečni limit potrošnje.

            Mjesečna potrošnja: {MonthSpent} {Currency}
            Mjesečni limit:     {Cap} {Currency}

            AI analize će biti blokirane do kraja mjeseca ili dok admin ne podigne limit.

            Srdačan pozdrav,
            CarScanner Team
            ===============================================
            """,
            recipientEmail,
            recipientName,
            recipientName,
            monthSpent,
            currency,
            cap,
            currency);

        return Task.CompletedTask;
    }
}
