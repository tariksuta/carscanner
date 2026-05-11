using CarScanner.Application.Abstraction.Notifications;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace CarScanner.Infrastructure.Notifications;

public sealed class SmtpEmailNotificationService(
    IOptions<EmailOptions> options,
    ILogger<SmtpEmailNotificationService> logger)
    : IEmailNotificationService
{
    private readonly EmailOptions _options = options.Value;

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
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Generiran je izvještaj o oštećenjima za vaše nedavno iznajmljivanje.</p>
            <ul>
              <li><strong>Vozilo:</strong> {vehicleInfo}</li>
              <li><strong>Iznajmljivanje:</strong> {rentalInfo}</li>
              <li><strong>Broj oštećenja:</strong> {damageCount}</li>
              <li><strong>Procijenjena cijena:</strong> {totalEstimatedCost:C}</li>
            </ul>
            <p><a href="{reportUrl}">Pogledajte cijeli izvještaj</a></p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, $"Izvještaj o oštećenjima - {vehicleInfo}", body, cancellationToken);
    }

    public Task SendRentalConfirmationAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateTime pickupDate,
        DateTime expectedReturnDate,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vaše iznajmljivanje je potvrđeno.</p>
            <ul>
              <li><strong>Vozilo:</strong> {vehicleInfo}</li>
              <li><strong>Preuzimanje:</strong> {pickupDate:dd.MM.yyyy HH:mm}</li>
              <li><strong>Očekivani povrat:</strong> {expectedReturnDate:dd.MM.yyyy HH:mm}</li>
            </ul>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, $"Potvrda iznajmljivanja - {vehicleInfo}", body, cancellationToken);
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
            ? "Detektovana su oštećenja. Zaseban izvještaj bit će poslan."
            : "Nije pronađeno nijedno oštećenje. Hvala vam što ste vratili vozilo u ispravnom stanju.";

        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vaše iznajmljivanje je završeno.</p>
            <ul>
              <li><strong>Vozilo:</strong> {vehicleInfo}</li>
              <li><strong>Datum povrata:</strong> {returnDate:dd.MM.yyyy HH:mm}</li>
            </ul>
            <p>{damageStatus}</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, $"Iznajmljivanje završeno - {vehicleInfo}", body, cancellationToken);
    }

    public Task SendEmployeeWelcomeAsync(
        string recipientEmail,
        string recipientName,
        string temporaryPassword,
        CancellationToken cancellationToken = default)
    {
        var loginLink = string.IsNullOrWhiteSpace(_options.LoginUrl)
            ? string.Empty
            : $"""<p><a href="{_options.LoginUrl}">Prijavite se ovdje</a></p>""";

        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vaš korisnički nalog u sistemu CarScanner je kreiran.</p>
            <p><strong>Email:</strong> {recipientEmail}<br/>
            <strong>Privremena lozinka:</strong> <code>{temporaryPassword}</code></p>
            {loginLink}
            <p>Iz sigurnosnih razloga, preporučujemo da promijenite lozinku pri prvoj prijavi.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, "Dobrodošli u CarScanner", body, cancellationToken);
    }

    public Task SendLowBalanceAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal balance,
        decimal threshold,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vaš AI kredit je pao ispod podešenog praga upozorenja.</p>
            <ul>
              <li><strong>Trenutni balans:</strong> {balance:F2} {currency}</li>
              <li><strong>Prag upozorenja:</strong> {threshold:F2} {currency}</li>
            </ul>
            <p>Preporučujemo da dopunite kredit kako biste izbjegli prekid AI analiza.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, "Upozorenje: nizak balans", body, cancellationToken);
    }

    public Task SendBalanceExhaustedAlertAsync(
        string recipientEmail,
        string recipientName,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vaš AI kredit ({currency}) je iscrpljen. AI analiza je trenutno pauzirana za vaš nalog.</p>
            <p>Dopunite balans kako biste nastavili koristiti AI funkcije.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, "AI servis pauziran — balans je iscrpljen", body, cancellationToken);
    }

    public Task SendMonthlyCapReachedAlertAsync(
        string recipientEmail,
        string recipientName,
        decimal monthSpent,
        decimal cap,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Dostigli ste podešeni mjesečni limit potrošnje.</p>
            <ul>
              <li><strong>Mjesečna potrošnja:</strong> {monthSpent:F2} {currency}</li>
              <li><strong>Mjesečni limit:</strong> {cap:F2} {currency}</li>
            </ul>
            <p>AI analize će biti blokirane do kraja mjeseca ili dok admin ne podigne limit.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(recipientEmail, recipientName, "Mjesečni limit dostignut", body, cancellationToken);
    }

    public Task SendRegistrationExpiryReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateOnly dueDate,
        int daysUntilDue,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Registracija za vozilo <strong>{vehicleInfo}</strong> ističe <strong>{dueDate:dd.MM.yyyy}</strong> (još {daysUntilDue} dan(a)).</p>
            <p>Ne propustite produženje kako biste izbjegli prekid korištenja vozila.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(
            recipientEmail, recipientName,
            $"Registracija ističe za {daysUntilDue} dan(a) - {vehicleInfo}",
            body, cancellationToken);
    }

    public Task SendInsuranceExpiryReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        DateOnly dueDate,
        int daysUntilDue,
        CancellationToken cancellationToken = default)
    {
        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Osiguranje za vozilo <strong>{vehicleInfo}</strong> ističe <strong>{dueDate:dd.MM.yyyy}</strong> (još {daysUntilDue} dan(a)).</p>
            <p>Obnovite osiguranje na vrijeme.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(
            recipientEmail, recipientName,
            $"Osiguranje ističe za {daysUntilDue} dan(a) - {vehicleInfo}",
            body, cancellationToken);
    }

    public Task SendServiceDueReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string description,
        DateOnly? dueDate,
        int? dueMileage,
        int? currentMileage,
        CancellationToken cancellationToken = default)
    {
        var dueText = BuildServiceDueText(dueDate, dueMileage, currentMileage);

        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Vrijeme je za servis vozila <strong>{vehicleInfo}</strong>.</p>
            <ul>
              <li><strong>Opis:</strong> {description}</li>
              <li><strong>Dospijeva:</strong> {dueText}</li>
            </ul>
            <p>Zakazujte servis na vrijeme kako biste održali vozilo u ispravnom stanju.</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(
            recipientEmail, recipientName,
            $"Servis vozila uskoro - {vehicleInfo}",
            body, cancellationToken);
    }

    public Task SendCustomReminderAsync(
        string recipientEmail,
        string recipientName,
        string vehicleInfo,
        string title,
        string description,
        DateOnly? dueDate,
        CancellationToken cancellationToken = default)
    {
        var dueText = dueDate.HasValue ? dueDate.Value.ToString("dd.MM.yyyy") : "—";

        var body = $"""
            <p>Poštovani {recipientName},</p>
            <p>Podsjetnik za vozilo <strong>{vehicleInfo}</strong>:</p>
            <h3>{title}</h3>
            <p>{description}</p>
            <p><strong>Dospijeva:</strong> {dueText}</p>
            <p>Srdačan pozdrav,<br/>CarScanner Team</p>
            """;

        return SendAsync(
            recipientEmail, recipientName,
            $"Podsjetnik: {title}",
            body, cancellationToken);
    }

    private static string BuildServiceDueText(DateOnly? dueDate, int? dueMileage, int? currentMileage)
    {
        if (dueDate.HasValue && dueMileage.HasValue)
            return $"{dueDate.Value:dd.MM.yyyy} ili {dueMileage.Value} km (trenutno {currentMileage?.ToString() ?? "?"} km)";
        if (dueDate.HasValue)
            return dueDate.Value.ToString("dd.MM.yyyy");
        if (dueMileage.HasValue)
            return $"{dueMileage.Value} km (trenutno {currentMileage?.ToString() ?? "?"} km)";
        return "—";
    }

    private async Task SendAsync(
        string recipientEmail,
        string recipientName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        message.To.Add(new MailboxAddress(recipientName, recipientEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            var socketOptions = _options.UseStartTls
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.SslOnConnect;

            await client.ConnectAsync(_options.SmtpHost, _options.SmtpPort, socketOptions, cancellationToken);
            await client.AuthenticateAsync(_options.SmtpUser, _options.SmtpPassword, cancellationToken);
            await client.SendAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {RecipientEmail} (subject: {Subject})", recipientEmail, subject);
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}
