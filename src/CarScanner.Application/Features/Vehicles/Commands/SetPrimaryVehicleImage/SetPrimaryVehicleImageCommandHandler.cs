using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.SetPrimaryVehicleImage;

public sealed class SetPrimaryVehicleImageCommandHandler(
    IVehicleRepository vehicleRepository)
    : ICommandHandler<SetPrimaryVehicleImageCommand, Result>
{
    public async Task<Result> Handle(
        SetPrimaryVehicleImageCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetWithImagesAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure(VehicleDomainErrors.NotFound(request.VehicleId));

        return vehicle.SetPrimaryImage(request.ImageId);
    }
}
