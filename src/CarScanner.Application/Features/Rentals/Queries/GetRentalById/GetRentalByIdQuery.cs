using CarScanner.Application.Features.Rentals.Queries.GetRentals;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Queries.GetRentalById;

public sealed record GetRentalByIdQuery(Guid RentalId) : IQuery<Result<RentalDto>>;
