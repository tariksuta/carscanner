using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.UploadPhoto;

public sealed record UploadPhotoCommand(
    Guid InspectionId,
    PhotoPosition Position,
    Stream PhotoStream,
    string FileName,
    string ContentType) : ICommand<Result<UploadPhotoCommandResult>>;

public sealed record UploadPhotoCommandResult(Guid PhotoId, string PhotoUrl);
