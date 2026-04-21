using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.UpdateVehicle;

public sealed class UpdateVehicleCommandHandler(
    IVehicleRepository vehicleRepository)
    : ICommandHandler<UpdateVehicleCommand, Result>
{
    public async Task<Result> Handle(
        UpdateVehicleCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure(VehicleDomainErrors.NotFound(request.VehicleId));

        var updateResult = vehicle.Update(
            request.Brand,
            request.Model,
            request.Year,
            request.LicensePlate,
            request.Color,
            request.Fuel,
            request.Gear,
            request.PowerKw,
            request.Seats,
            request.RegistrationExpiry,
            request.InsuranceExpiry);

        if (updateResult.IsFailure)
            return updateResult;

        vehicle.UpdateMileage(request.CurrentMileage);

        if (request.Status != vehicle.Status)
        {
            var statusResult = vehicle.ChangeStatus(request.Status);
            if (statusResult.IsFailure)
                return statusResult;
        }

        return Result.Success();
    }
}
