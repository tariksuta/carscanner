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
