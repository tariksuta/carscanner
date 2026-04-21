using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.UploadPhoto;

public sealed class UploadPhotoCommandHandler(
    IVehicleInspectionRepository inspectionRepository,
    IFileStorageService fileStorageService)
    : ICommandHandler<UploadPhotoCommand, Result<UploadPhotoCommandResult>>
{
    public async Task<Result<UploadPhotoCommandResult>> Handle(
        UploadPhotoCommand request,
        CancellationToken cancellationToken)
    {
        var inspection = await inspectionRepository.GetWithPhotosAsync(request.InspectionId, cancellationToken);
        if (inspection is null)
            return Result.Failure<UploadPhotoCommandResult>(InspectionDomainErrors.NotFound(request.InspectionId));

        var fileName = $"{inspection.Id}/{request.Position}_{Guid.NewGuid()}{Path.GetExtension(request.FileName)}";

        var photoUrl = await fileStorageService.UploadFileAsync(
            request.PhotoStream,
            fileName,
            request.ContentType,
            "inspection-photos",
            cancellationToken);

        var addResult = inspection.AddPhoto(request.Position, photoUrl);
        if (addResult.IsFailure)
            return Result.Failure<UploadPhotoCommandResult>(addResult.Error);

        var photo = inspection.GetPhotoByPosition(request.Position);

        return new UploadPhotoCommandResult(photo!.Id, photoUrl);
    }
}
