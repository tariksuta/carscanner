using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.DeleteVehicleImage;

public sealed class DeleteVehicleImageCommandHandler(
    IVehicleRepository vehicleRepository,
    IFileStorageService fileStorageService)
    : ICommandHandler<DeleteVehicleImageCommand, Result>
{
    public async Task<Result> Handle(
        DeleteVehicleImageCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetWithImagesAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure(VehicleDomainErrors.NotFound(request.VehicleId));

        var image = vehicle.Images.FirstOrDefault(i => i.Id == request.ImageId);
        if (image is null)
            return Result.Failure(VehicleDomainErrors.ImageNotFound(request.ImageId));

        var imageUrl = image.ImageUrl;

        var removeResult = vehicle.RemoveImage(request.ImageId);
        if (removeResult.IsFailure)
            return removeResult;

        await fileStorageService.DeleteFileAsync(imageUrl, cancellationToken);

        return Result.Success();
    }
}
