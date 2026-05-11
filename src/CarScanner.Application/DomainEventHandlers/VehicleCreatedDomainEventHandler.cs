using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class VehicleCreatedDomainEventHandler(
    ITenantProvider tenantProvider,
    IMaintenanceReminderRepository reminderRepository,
    IUnitOfWork unitOfWork,
    ILogger<VehicleCreatedDomainEventHandler> logger)
    : IDomainEventHandler<VehicleCreatedDomainEvent>
{
    public async Task Handle(VehicleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return;

        var anyCreated = false;

        if (notification.RegistrationExpiry is { } regExpiry)
        {
            var result = MaintenanceReminder.Create(
                tenantId,
                notification.VehicleId,
                ReminderType.RegistrationExpiry,
                regExpiry,
                dueMileage: null,
                description: $"Registracija ističe {regExpiry:dd.MM.yyyy}");

            if (result.IsSuccess)
            {
                reminderRepository.Add(result.Value);
                anyCreated = true;
            }
            else
            {
                logger.LogWarning("Failed to create registration reminder for vehicle {VehicleId}: {Error}",
                    notification.VehicleId, result.Error.Code);
            }
        }

        if (notification.InsuranceExpiry is { } insExpiry)
        {
            var result = MaintenanceReminder.Create(
                tenantId,
                notification.VehicleId,
                ReminderType.InsuranceExpiry,
                insExpiry,
                dueMileage: null,
                description: $"Osiguranje ističe {insExpiry:dd.MM.yyyy}");

            if (result.IsSuccess)
            {
                reminderRepository.Add(result.Value);
                anyCreated = true;
            }
            else
            {
                logger.LogWarning("Failed to create insurance reminder for vehicle {VehicleId}: {Error}",
                    notification.VehicleId, result.Error.Code);
            }
        }

        if (anyCreated)
            await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
