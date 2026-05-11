using CarScanner.Application.Abstraction.Imaging;
using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.UploadProfileImage;

public sealed class UploadProfileImageCommandHandler(
    IApplicationUserRepository userRepository,
    IFileStorageService fileStorageService,
    IImageProcessingService imageProcessingService)
    : ICommandHandler<UploadProfileImageCommand, Result<UploadProfileImageCommandResult>>
{
    public async Task<Result<UploadProfileImageCommandResult>> Handle(
        UploadProfileImageCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure<UploadProfileImageCommandResult>(
                ApplicationUserDomainErrors.NotFound(request.UserId));

        ProcessedImage processed;
        try
        {
            processed = await imageProcessingService.ProcessAsync(request.ImageStream, cancellationToken);
        }
        catch (ImageProcessingException ex)
        {
            return Result.Failure<UploadProfileImageCommandResult>(
                ApplicationUserDomainErrors.InvalidProfileImage(ex.Message));
        }

        if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl))
        {
            await fileStorageService.DeleteFileAsync(user.ProfileImageUrl, cancellationToken);
        }

        var fileName = $"{user.Id}/{Guid.NewGuid()}{processed.Extension}";

        var imageUrl = await fileStorageService.UploadFileAsync(
            processed.Stream,
            fileName,
            processed.ContentType,
            "profile-images",
            cancellationToken);

        user.SetProfileImage(imageUrl);

        return new UploadProfileImageCommandResult(imageUrl);
    }
}
