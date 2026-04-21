using CarScanner.Domain.Aggregates.DamageReportAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate.Events;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Application.DomainEventHandlers;

public sealed class RentalCompletedDomainEventHandler(
    IRentalRepository rentalRepository,
    IDamageReportRepository damageReportRepository,
    IUnitOfWork unitOfWork)
    : IDomainEventHandler<RentalCompletedDomainEvent>
{
    public async Task Handle(RentalCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        var rental = await rentalRepository.GetByIdAsync(notification.RentalId, cancellationToken);
        if (rental is null) return;

        var existingReport = await damageReportRepository.GetByRentalIdAsync(notification.RentalId, cancellationToken);
        if (existingReport is not null) return;

        var reportResult = DamageReport.Create(
            notification.RentalId,
            rental.ClientId,
            notification.PickupInspectionId,
            notification.ReturnInspectionId);

        if (reportResult.IsFailure) return;

        damageReportRepository.Add(reportResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
