using CarScanner.Application.Features.Rentals.Queries.GetRentals;
using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Queries.GetRentalById;

public sealed class GetRentalByIdQueryHandler(IRentalRepository rentalRepository)
    : IQueryHandler<GetRentalByIdQuery, Result<RentalDto>>
{
    public async Task<Result<RentalDto>> Handle(
        GetRentalByIdQuery request,
        CancellationToken cancellationToken)
    {
        var rental = await rentalRepository.GetByIdAsync(request.RentalId, cancellationToken);
        if (rental is null)
            return Result.Failure<RentalDto>(RentalDomainErrors.NotFound(request.RentalId));

        return new RentalDto(
            rental.Id,
            rental.VehicleId,
            rental.ClientId,
            rental.PickupEmployeeId,
            rental.ReturnEmployeeId,
            rental.PickupInspectionId,
            rental.ReturnInspectionId,
            rental.PickupDate,
            rental.ExpectedReturnDate,
            rental.ActualReturnDate,
            rental.PickupMileage,
            rental.ReturnMileage,
            rental.Price,
            rental.Status,
            rental.Notes);
    }
}
