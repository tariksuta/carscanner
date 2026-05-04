using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Domain.Aggregates.BillingAggregate.Events;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class LowBalanceReachedDomainEventHandler(
    ITenantRepository tenantRepository,
    IBillingAccountRepository billingAccountRepository,
    IEmailNotificationService emailNotificationService,
    ILogger<LowBalanceReachedDomainEventHandler> logger)
    : IDomainEventHandler<LowBalanceReachedDomainEvent>
{
    public async Task Handle(LowBalanceReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        var tenant = await tenantRepository.GetByIdAsync(notification.TenantId, cancellationToken);
        if (tenant is null || tenant.Status != TenantStatus.Active)
            return;

        var account = await billingAccountRepository.GetByTenantIdAsync(notification.TenantId, cancellationToken);
        var currency = account?.Currency ?? "USD";

        try
        {
            await emailNotificationService.SendLowBalanceAlertAsync(
                tenant.ContactEmail,
                tenant.Name,
                notification.Balance,
                notification.Threshold,
                currency,
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Failed to send low-balance alert to tenant {TenantId} ({Email})",
                tenant.Id, tenant.ContactEmail);
        }
    }
}
