using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class VehicleInsuranceExpiryUpdatedDomainEventHandler(
    ITenantProvider tenantProvider,
    IMaintenanceReminderRepository reminderRepository,
    IUnitOfWork unitOfWork,
    ILogger<VehicleInsuranceExpiryUpdatedDomainEventHandler> logger)
    : IDomainEventHandler<VehicleInsuranceExpiryUpdatedDomainEvent>
{
    public async Task Handle(
        VehicleInsuranceExpiryUpdatedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return;

        var existing = await reminderRepository.GetByVehicleAndTypeAsync(
            notification.VehicleId, ReminderType.InsuranceExpiry, cancellationToken);

        if (notification.NewExpiry is { } newExpiry)
        {
            var description = $"Osiguranje ističe {newExpiry:dd.MM.yyyy}";

            if (existing is null)
            {
                var result = MaintenanceReminder.Create(
                    tenantId, notification.VehicleId, ReminderType.InsuranceExpiry,
                    newExpiry, dueMileage: null, description);

                if (result.IsSuccess)
                    reminderRepository.Add(result.Value);
                else
                    logger.LogWarning("Failed to create insurance reminder: {Error}", result.Error.Code);
            }
            else
            {
                if (!existing.IsActive)
                    existing.Reactivate();
                existing.Update(newExpiry, dueMileage: null, description);
                reminderRepository.Update(existing);
            }
        }
        else if (existing is not null && existing.IsActive)
        {
            existing.Dismiss();
            reminderRepository.Update(existing);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
