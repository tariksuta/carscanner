using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Queries.GetRentals;

public sealed record GetRentalsQuery(
    int Page = 1,
    int PageSize = 10) : IQuery<Result<PagedResult<RentalDto>>>;

public sealed record RentalDto(
    Guid Id,
    Guid VehicleId,
    Guid ClientId,
    Guid? PickupEmployeeId,
    Guid? ReturnEmployeeId,
    Guid? PickupInspectionId,
    Guid? ReturnInspectionId,
    DateTime? PickupDate,
    DateTime ExpectedReturnDate,
    DateTime? ActualReturnDate,
    int? PickupMileage,
    int? ReturnMileage,
    RentalStatus Status,
    string? Notes);
