using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.Application.Abstraction.Billing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.AI;

public sealed class BillingAwareVehicleDamageAnalyzer(
    IVehicleDamageAnalyzer inner,
    IBillingService billing,
    IConfiguration configuration,
    ILogger<BillingAwareVehicleDamageAnalyzer> logger)
    : IVehicleDamageAnalyzer
{
    private const string Feature = "DamageAnalysis";
    private const string DefaultModel = "gpt-4o";

    public async Task<DamageAnalysisOutcome> AnalyzeDamageAsync(
        DamageAnalysisRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!IsEnforcementEnabled())
        {
            return await inner.AnalyzeDamageAsync(request, cancellationToken);
        }

        var model = configuration["OpenAI:Model"] ?? DefaultModel;
        var photoPairs = request.PhotoPairs.Count;

        var reserveResult = await billing.ReserveAsync(
            photoPairs, model, damageReportId: null, Feature, cancellationToken);

        if (reserveResult.IsFailure)
        {
            logger.LogWarning(
                "Damage analysis blocked by billing: {Code} - {Message}",
                reserveResult.Error.Code, reserveResult.Error.Message);

            return new DamageAnalysisOutcome(
                DamageAnalysisResult.Failed(reserveResult.Error.Message),
                null);
        }

        var ticket = reserveResult.Value;

        DamageAnalysisOutcome outcome;
        try
        {
            outcome = await inner.AnalyzeDamageAsync(request, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "AI analysis threw unexpectedly, refunding reservation {ReservationId}",
                ticket.ReservationId);
            await SafeRefundAsync(ticket, ex.Message);
            throw;
        }

        try
        {
            if (outcome.Result.Success && outcome.Usage is not null)
            {
                await billing.CommitAsync(ticket, outcome.Usage, fallbackContext: null, cancellationToken);
            }
            else if (outcome.Result.Success)
            {
                await billing.CommitAsync(
                    ticket,
                    usage: null,
                    fallbackContext: "OpenAI response missing usage block",
                    cancellationToken);
            }
            else
            {
                await billing.RefundAsync(ticket, outcome.Result.ErrorMessage, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            // Reconciliation failure must NOT fail the user — we already have the AI result.
            // The phase-6 stale-reservation sweep will recover.
            logger.LogError(ex,
                "Billing reconciliation failed for reservation {ReservationId}",
                ticket.ReservationId);
        }

        return outcome;
    }

    private bool IsEnforcementEnabled() =>
        bool.TryParse(configuration["Billing:EnforcementEnabled"], out var enabled) && enabled;

    private async Task SafeRefundAsync(BillingTicket ticket, string? errorContext)
    {
        try
        {
            await billing.RefundAsync(ticket, errorContext, CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Refund attempt failed for reservation {ReservationId}",
                ticket.ReservationId);
        }
    }
}
