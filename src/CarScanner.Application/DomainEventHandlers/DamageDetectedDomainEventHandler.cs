using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Events;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class DamageDetectedDomainEventHandler(
    IRentalRepository rentalRepository,
    IClientRepository clientRepository,
    IVehicleRepository vehicleRepository,
    IEmailNotificationService emailNotificationService)
    : IDomainEventHandler<DamageDetectedDomainEvent>
{
    public async Task Handle(DamageDetectedDomainEvent notification, CancellationToken cancellationToken)
    {
        var client = await clientRepository.GetByIdAsync(notification.ClientId, cancellationToken);
        if (client is null) return;

        var rental = await rentalRepository.GetByIdAsync(notification.RentalId, cancellationToken);
        if (rental is null) return;

        var vehicle = await vehicleRepository.GetByIdAsync(rental.VehicleId, cancellationToken);
        var vehicleInfo = vehicle is not null
            ? $"{vehicle.Brand} {vehicle.Model} ({vehicle.Year})"
            : "Vehicle";

        var rentalInfo = $"Rental #{notification.RentalId.ToString()[..8]}";
        var reportUrl = $"/damage-reports/{notification.DamageReportId}";

        await emailNotificationService.SendDamageReportNotificationAsync(
            client.Email,
            client.FullName,
            vehicleInfo,
            rentalInfo,
            notification.DamageCount,
            notification.TotalEstimatedCost,
            reportUrl,
            cancellationToken);
    }
}
