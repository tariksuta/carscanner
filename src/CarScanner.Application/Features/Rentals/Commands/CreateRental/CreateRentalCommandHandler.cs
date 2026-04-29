using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate;
using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Commands.CreateRental;

public sealed class CreateRentalCommandHandler(
    IRentalRepository rentalRepository,
    IVehicleRepository vehicleRepository,
    IClientRepository clientRepository)
    : ICommandHandler<CreateRentalCommand, Result<CreateRentalCommandResult>>
{
    public async Task<Result<CreateRentalCommandResult>> Handle(
        CreateRentalCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<CreateRentalCommandResult>(VehicleDomainErrors.NotFound(request.VehicleId));

        if (vehicle.Status != Domain.Enums.VehicleStatus.Available)
            return Result.Failure<CreateRentalCommandResult>(RentalDomainErrors.VehicleNotAvailable);

        var client = await clientRepository.GetByIdAsync(request.ClientId, cancellationToken);
        if (client is null)
            return Result.Failure<CreateRentalCommandResult>(ClientDomainErrors.NotFound(request.ClientId));

        if (!client.CanRent())
            return Result.Failure<CreateRentalCommandResult>(RentalDomainErrors.ClientCannotRent);

        var rentalResult = Rental.Create(
            request.VehicleId,
            request.ClientId,
            request.ExpectedReturnDate,
            request.Price,
            request.Notes);

        if (rentalResult.IsFailure)
            return Result.Failure<CreateRentalCommandResult>(rentalResult.Error);

        rentalRepository.Add(rentalResult.Value);

        return new CreateRentalCommandResult(rentalResult.Value.Id);
    }
}
