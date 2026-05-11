using CarScanner.Application.Abstraction.Imaging;
using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.UploadVehicleImage;

public sealed class UploadVehicleImageCommandHandler(
    IVehicleRepository vehicleRepository,
    IFileStorageService fileStorageService,
    IImageProcessingService imageProcessingService)
    : ICommandHandler<UploadVehicleImageCommand, Result<UploadVehicleImageCommandResult>>
{
    public async Task<Result<UploadVehicleImageCommandResult>> Handle(
        UploadVehicleImageCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetWithImagesAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<UploadVehicleImageCommandResult>(
                VehicleDomainErrors.NotFound(request.VehicleId));

        ProcessedImage processed;
        try
        {
            processed = await imageProcessingService.ProcessAsync(request.ImageStream, cancellationToken);
        }
        catch (ImageProcessingException ex)
        {
            return Result.Failure<UploadVehicleImageCommandResult>(
                VehicleDomainErrors.InvalidImage(ex.Message));
        }

        var fileName = $"{vehicle.Id}/{Guid.NewGuid()}{processed.Extension}";

        var imageUrl = await fileStorageService.UploadFileAsync(
            processed.Stream,
            fileName,
            processed.ContentType,
            "vehicle-images",
            cancellationToken);

        var addResult = vehicle.AddImage(imageUrl, request.IsPrimary);
        if (addResult.IsFailure)
        {
            await fileStorageService.DeleteFileAsync(imageUrl, cancellationToken);
            return Result.Failure<UploadVehicleImageCommandResult>(addResult.Error);
        }

        var newImage = vehicle.Images.OrderByDescending(i => i.UploadedAt).First();

        return new UploadVehicleImageCommandResult(newImage.Id, imageUrl);
    }
}
