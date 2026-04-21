using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.CompleteInspection;

public sealed class CompleteInspectionCommandHandler(
    IVehicleInspectionRepository inspectionRepository,
    IRentalRepository rentalRepository,
    IVehicleRepository vehicleRepository)
    : ICommandHandler<CompleteInspectionCommand, Result<CompleteInspectionCommandResult>>
{
    public async Task<Result<CompleteInspectionCommandResult>> Handle(
        CompleteInspectionCommand request,
        CancellationToken cancellationToken)
    {
        var inspection = await inspectionRepository.GetWithPhotosAsync(request.InspectionId, cancellationToken);
        if (inspection is null)
            return Result.Failure<CompleteInspectionCommandResult>(InspectionDomainErrors.NotFound(request.InspectionId));

        var completeResult = inspection.Complete();
        if (completeResult.IsFailure)
            return Result.Failure<CompleteInspectionCommandResult>(completeResult.Error);

        var rental = await rentalRepository.GetByIdAsync(inspection.RentalId, cancellationToken);
        if (rental is null)
            return Result.Failure<CompleteInspectionCommandResult>(RentalDomainErrors.NotFound(inspection.RentalId));

        var vehicle = await vehicleRepository.GetByIdAsync(inspection.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<CompleteInspectionCommandResult>(VehicleDomainErrors.NotFound(inspection.VehicleId));

        if (inspection.InspectionType == InspectionType.Pickup)
        {
            var pickupResult = rental.CompletePickup(inspection.Id, request.CurrentMileage);
            if (pickupResult.IsFailure)
                return Result.Failure<CompleteInspectionCommandResult>(pickupResult.Error);

            vehicle.MarkAsRented();
            vehicle.UpdateMileage(request.CurrentMileage);
        }
        else
        {
            var returnResult = rental.CompleteReturn(inspection.Id, request.CurrentMileage);
            if (returnResult.IsFailure)
                return Result.Failure<CompleteInspectionCommandResult>(returnResult.Error);

            vehicle.MarkAsAvailable(request.CurrentMileage);
        }

        return new CompleteInspectionCommandResult(inspection.Id, inspection.InspectionType == InspectionType.Return);
    }
}
