using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Commands.ChangeRentalStatus;

public sealed class ChangeRentalStatusCommandHandler(
    IRentalRepository rentalRepository)
    : ICommandHandler<ChangeRentalStatusCommand, Result>
{
    public async Task<Result> Handle(
        ChangeRentalStatusCommand request,
        CancellationToken cancellationToken)
    {
        var rental = await rentalRepository.GetByIdAsync(request.RentalId, cancellationToken);
        if (rental is null)
            return Result.Failure(RentalDomainErrors.NotFound(request.RentalId));

        var result = request.TargetStatus switch
        {
            RentalStatus.PickupInProgress => request.EmployeeId.HasValue
                ? rental.StartPickupInspection(request.EmployeeId.Value)
                : Result.Failure(RentalDomainErrors.EmployeeRequired),

            RentalStatus.Active => request.InspectionId.HasValue && request.Mileage.HasValue
                ? rental.CompletePickup(request.InspectionId.Value, request.Mileage.Value)
                : Result.Failure(RentalDomainErrors.PickupInspectionRequired),

            RentalStatus.ReturnInProgress => request.EmployeeId.HasValue
                ? rental.StartReturnInspection(request.EmployeeId.Value)
                : Result.Failure(RentalDomainErrors.EmployeeRequired),

            RentalStatus.Completed => request.InspectionId.HasValue && request.Mileage.HasValue
                ? rental.CompleteReturn(request.InspectionId.Value, request.Mileage.Value)
                : Result.Failure(RentalDomainErrors.ReturnInspectionRequired),

            RentalStatus.Cancelled => rental.Cancel(),

            _ => Result.Failure(RentalDomainErrors.InvalidStatusTransition),
        };

        return result;
    }
}
