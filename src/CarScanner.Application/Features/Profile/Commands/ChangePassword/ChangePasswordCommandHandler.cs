using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;
using Microsoft.AspNetCore.Identity;

namespace CarScanner.Application.Features.Profile.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    IApplicationUserRepository userRepository,
    IPasswordHasher<ApplicationUser> passwordHasher)
    : ICommandHandler<ChangePasswordCommand, Result>
{
    public async Task<Result> Handle(
        ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure(ApplicationUserDomainErrors.NotFound(request.UserId));

        var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);

        if (verifyResult == PasswordVerificationResult.Failed)
            return Result.Failure(ApplicationUserDomainErrors.InvalidCurrentPassword);

        var newHash = passwordHasher.HashPassword(user, request.NewPassword);

        return user.UpdatePassword(newHash);
    }
}
