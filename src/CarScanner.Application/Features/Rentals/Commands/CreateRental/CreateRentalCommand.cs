using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Commands.CreateRental;

public sealed record CreateRentalCommand(
    Guid VehicleId,
    Guid ClientId,
    DateTime ExpectedReturnDate,
    decimal Price,
    string? Notes) : ICommand<Result<CreateRentalCommandResult>>;

public sealed record CreateRentalCommandResult(Guid RentalId);
