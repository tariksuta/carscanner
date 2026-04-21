using CarScanner.Application.Abstraction.Storage;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.DeleteProfileImage;

public sealed class DeleteProfileImageCommandHandler(
    IApplicationUserRepository userRepository,
    IFileStorageService fileStorageService)
    : ICommandHandler<DeleteProfileImageCommand, Result>
{
    public async Task<Result> Handle(
        DeleteProfileImageCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure(ApplicationUserDomainErrors.NotFound(request.UserId));

        if (string.IsNullOrWhiteSpace(user.ProfileImageUrl))
            return Result.Success();

        await fileStorageService.DeleteFileAsync(user.ProfileImageUrl, cancellationToken);
        user.RemoveProfileImage();

        return Result.Success();
    }
}
