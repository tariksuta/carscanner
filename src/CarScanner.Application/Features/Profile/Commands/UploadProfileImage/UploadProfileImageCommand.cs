using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.UploadProfileImage;

public sealed record UploadProfileImageCommand(
    Guid UserId,
    Stream ImageStream,
    string FileName,
    string ContentType) : ICommand<Result<UploadProfileImageCommandResult>>;

public sealed record UploadProfileImageCommandResult(string ImageUrl);
