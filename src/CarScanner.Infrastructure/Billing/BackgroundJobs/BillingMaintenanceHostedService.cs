using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.Billing.BackgroundJobs;

/// <summary>
/// Periodic billing housekeeping. Three independent jobs run on their own cadence:
/// <list type="bullet">
///   <item>Roll monthly anchors hourly — resets <c>MonthSpent</c> when a tenant crosses
///         a UTC month boundary without running an analysis (Reserve does this lazily,
///         this is the safety net for inactive tenants).</item>
///   <item>Sweep stale reservations every 5 min — refunds any pending reservation older
///         than 1 hour, recovering credits left held by a process that crashed mid-call.</item>
///   <item>Send low-balance digests daily — reminder email for tenants who've been below
///         their threshold for an extended period (the immediate alert from the domain
///         event handler fires once per dip; this is the follow-up nag).</item>
/// </list>
/// All jobs are idempotent and use scoped DI so EF tracking is fresh per tick.
/// </summary>
public sealed class BillingMaintenanceHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<BillingMaintenanceHostedService> logger)
    : BackgroundService
{
    private static readonly TimeSpan RollInterval = TimeSpan.FromHours(1);
    private static readonly TimeSpan SweepInterval = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan DigestInterval = TimeSpan.FromDays(1);
    private static readonly TimeSpan StaleReservationAge = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("BillingMaintenanceHostedService started.");

        var tasks = new[]
        {
            RunPeriodicallyAsync("RollMonthlyAnchors", RollInterval, RollMonthlyAnchorsAsync, stoppingToken),
            RunPeriodicallyAsync("SweepStaleReservations", SweepInterval, SweepStaleReservationsAsync, stoppingToken),
            RunPeriodicallyAsync("SendLowBalanceDigests", DigestInterval, SendLowBalanceDigestsAsync, stoppingToken),
        };

        await Task.WhenAll(tasks);
    }

    private async Task RunPeriodicallyAsync(
        string jobName,
        TimeSpan interval,
        Func<IServiceScope, CancellationToken, Task> work,
        CancellationToken ct)
    {
        using var timer = new PeriodicTimer(interval);

        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    await work(scope, ct);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Background billing job {Job} failed", jobName);
                }
            }
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation("Billing job {Job} cancelled — shutdown in progress.", jobName);
        }
    }

    private async Task RollMonthlyAnchorsAsync(IServiceScope scope, CancellationToken ct)
    {
        var accountRepo = scope.ServiceProvider.GetRequiredService<IBillingAccountRepository>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var accounts = await accountRepo.GetAllAsync(ct);
        var nowUtc = DateTime.UtcNow;
        var rolled = 0;

        foreach (var account in accounts)
        {
            var before = account.MonthAnchorUtc;
            account.RollMonthIfNeeded(nowUtc);
            if (account.MonthAnchorUtc != before) rolled++;
        }

        if (rolled > 0)
        {
            await uow.SaveChangesAsync(ct);
            logger.LogInformation("Rolled monthly anchor for {Count} billing accounts.", rolled);
        }
    }

    private async Task SweepStaleReservationsAsync(IServiceScope scope, CancellationToken ct)
    {
        var accountRepo = scope.ServiceProvider.GetRequiredService<IBillingAccountRepository>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var thresholdUtc = DateTime.UtcNow - StaleReservationAge;
        var staleAccounts = await accountRepo.GetAccountsWithStaleReservationsAsync(thresholdUtc, ct);

        if (staleAccounts.Count == 0) return;

        var nowUtc = DateTime.UtcNow;
        var refundedTotal = 0;

        foreach (var account in staleAccounts)
        {
            var stale = account.Reservations
                .Where(r => r.Status == ReservationStatus.Pending && r.CreatedAtUtc < thresholdUtc)
                .ToList();

            foreach (var reservation in stale)
            {
                var refundResult = account.RefundReservation(reservation.Id, nowUtc);
                if (refundResult.IsFailure)
                {
                    logger.LogWarning(
                        "Sweep refund failed for reservation {ReservationId}: {Error}",
                        reservation.Id, refundResult.Error.Message);
                    continue;
                }

                refundedTotal++;
            }
        }

        if (refundedTotal > 0)
        {
            await uow.SaveChangesAsync(ct);
            logger.LogWarning(
                "Auto-refunded {Count} stale reservations older than {Age}.",
                refundedTotal, StaleReservationAge);
        }
    }

    private async Task SendLowBalanceDigestsAsync(IServiceScope scope, CancellationToken ct)
    {
        var accountRepo = scope.ServiceProvider.GetRequiredService<IBillingAccountRepository>();
        var tenantRepo = scope.ServiceProvider.GetRequiredService<ITenantRepository>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();

        var accounts = await accountRepo.GetAlertableLowBalanceAccountsAsync(ct);

        if (accounts.Count == 0) return;

        var sent = 0;
        foreach (var account in accounts)
        {
            var tenant = await tenantRepo.GetByIdAsync(account.TenantId, ct);
            if (tenant is null || tenant.Status != TenantStatus.Active)
                continue;

            try
            {
                await emailService.SendLowBalanceAlertAsync(
                    tenant.ContactEmail,
                    tenant.Name,
                    account.Balance,
                    account.LowBalanceThreshold ?? 0m,
                    account.Currency,
                    ct);
                sent++;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Daily low-balance digest failed for tenant {TenantId}",
                    tenant.Id);
            }
        }

        if (sent > 0)
        {
            logger.LogInformation("Sent low-balance digest to {Count} tenants.", sent);
        }
    }
}
