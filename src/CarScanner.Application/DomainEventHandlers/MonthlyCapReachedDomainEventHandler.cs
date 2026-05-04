using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Domain.Aggregates.BillingAggregate.Events;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class MonthlyCapReachedDomainEventHandler(
    ITenantRepository tenantRepository,
    IBillingAccountRepository billingAccountRepository,
    IEmailNotificationService emailNotificationService,
    ILogger<MonthlyCapReachedDomainEventHandler> logger)
    : IDomainEventHandler<MonthlyCapReachedDomainEvent>
{
    public async Task Handle(MonthlyCapReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        var tenant = await tenantRepository.GetByIdAsync(notification.TenantId, cancellationToken);
        if (tenant is null || tenant.Status != TenantStatus.Active)
            return;

        var account = await billingAccountRepository.GetByTenantIdAsync(notification.TenantId, cancellationToken);
        var currency = account?.Currency ?? "USD";

        try
        {
            await emailNotificationService.SendMonthlyCapReachedAlertAsync(
                tenant.ContactEmail,
                tenant.Name,
                notification.MonthSpent,
                notification.Cap,
                currency,
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Failed to send monthly-cap-reached alert to tenant {TenantId} ({Email})",
                tenant.Id, tenant.ContactEmail);
        }
    }
}
