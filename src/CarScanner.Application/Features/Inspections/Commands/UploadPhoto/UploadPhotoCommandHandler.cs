using CarScanner.Application.Abstraction.Imaging;
using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.UploadPhoto;

public sealed class UploadPhotoCommandHandler(
    IVehicleInspectionRepository inspectionRepository,
    IFileStorageService fileStorageService,
    IImageProcessingService imageProcessingService)
    : ICommandHandler<UploadPhotoCommand, Result<UploadPhotoCommandResult>>
{
    public async Task<Result<UploadPhotoCommandResult>> Handle(
        UploadPhotoCommand request,
        CancellationToken cancellationToken)
    {
        var inspection = await inspectionRepository.GetWithPhotosAsync(request.InspectionId, cancellationToken);
        if (inspection is null)
            return Result.Failure<UploadPhotoCommandResult>(InspectionDomainErrors.NotFound(request.InspectionId));

        ProcessedImage processed;
        try
        {
            processed = await imageProcessingService.ProcessAsync(request.PhotoStream, cancellationToken);
        }
        catch (ImageProcessingException ex)
        {
            return Result.Failure<UploadPhotoCommandResult>(InspectionDomainErrors.InvalidPhoto(ex.Message));
        }

        var fileName = $"{inspection.Id}/{request.Position}_{Guid.NewGuid()}{processed.Extension}";

        var photoUrl = await fileStorageService.UploadFileAsync(
            processed.Stream,
            fileName,
            processed.ContentType,
            "inspection-photos",
            cancellationToken);

        var addResult = inspection.AddPhoto(request.Position, photoUrl);
        if (addResult.IsFailure)
            return Result.Failure<UploadPhotoCommandResult>(addResult.Error);

        var photo = inspection.GetPhotoByPosition(request.Position);

        return new UploadPhotoCommandResult(photo!.Id, photoUrl);
    }
}
