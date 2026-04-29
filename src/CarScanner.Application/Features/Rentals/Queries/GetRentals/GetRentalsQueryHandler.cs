using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Queries.GetRentals;

public sealed class GetRentalsQueryHandler(IRentalRepository rentalRepository)
    : IQueryHandler<GetRentalsQuery, Result<PagedResult<RentalDto>>>
{
    public async Task<Result<PagedResult<RentalDto>>> Handle(
        GetRentalsQuery request,
        CancellationToken cancellationToken)
    {
        var rentals = await rentalRepository.GetAllAsync(cancellationToken);
        var totalCount = rentals.Count;

        var items = rentals
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new RentalDto(
                r.Id,
                r.VehicleId,
                r.ClientId,
                r.PickupEmployeeId,
                r.ReturnEmployeeId,
                r.PickupInspectionId,
                r.ReturnInspectionId,
                r.PickupDate,
                r.ExpectedReturnDate,
                r.ActualReturnDate,
                r.PickupMileage,
                r.ReturnMileage,
                r.Price,
                r.Status,
                r.Notes))
            .ToList();

        return new PagedResult<RentalDto>(items, request.Page, request.PageSize, totalCount);
    }
}
