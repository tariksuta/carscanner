using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.CreateVehicle;

public sealed class CreateVehicleCommandHandler(IVehicleRepository vehicleRepository)
    : ICommandHandler<CreateVehicleCommand, Result<CreateVehicleCommandResult>>
{
    public async Task<Result<CreateVehicleCommandResult>> Handle(
        CreateVehicleCommand request,
        CancellationToken cancellationToken)
    {
        var existingVehicle = await vehicleRepository.GetByVinAsync(request.Vin, cancellationToken);
        if (existingVehicle is not null)
        {
            return Result.Failure<CreateVehicleCommandResult>(
                new DomainError("Vehicle.VinExists", "A vehicle with this VIN already exists."));
        }

        var vehicleResult = Vehicle.Create(
            request.Brand,
            request.Model,
            request.Year,
            request.LicensePlate,
            request.Vin,
            request.Color,
            request.CurrentMileage,
            request.Fuel,
            request.Gear,
            request.PowerKw,
            request.Seats,
            request.RegistrationExpiry,
            request.InsuranceExpiry);

        if (vehicleResult.IsFailure)
            return Result.Failure<CreateVehicleCommandResult>(vehicleResult.Error);

        vehicleRepository.Add(vehicleResult.Value);

        return new CreateVehicleCommandResult(vehicleResult.Value.Id);
    }
}
