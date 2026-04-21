using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.UploadProfileImage;

public sealed class UploadProfileImageCommandHandler(
    IApplicationUserRepository userRepository,
    IFileStorageService fileStorageService)
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

        // Delete old image if exists
        if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl))
        {
            await fileStorageService.DeleteFileAsync(user.ProfileImageUrl, cancellationToken);
        }

        var fileName = $"{user.Id}/{Guid.NewGuid()}{Path.GetExtension(request.FileName)}";

        var imageUrl = await fileStorageService.UploadFileAsync(
            request.ImageStream,
            fileName,
            request.ContentType,
            "profile-images",
            cancellationToken);

        user.SetProfileImage(imageUrl);

        return new UploadProfileImageCommandResult(imageUrl);
    }
}
