using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.ValueObjects;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.UpdateProfile;

public sealed class UpdateProfileCommandHandler(
    IApplicationUserRepository userRepository)
    : ICommandHandler<UpdateProfileCommand, Result>
{
    public async Task<Result> Handle(
        UpdateProfileCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure(ApplicationUserDomainErrors.NotFound(request.UserId));

        Address? address = null;

        if (!string.IsNullOrWhiteSpace(request.Street) ||
            !string.IsNullOrWhiteSpace(request.City) ||
            !string.IsNullOrWhiteSpace(request.ZipCode) ||
            !string.IsNullOrWhiteSpace(request.Country))
        {
            var addressResult = Address.Create(
                request.Street ?? string.Empty,
                request.City ?? string.Empty,
                request.ZipCode ?? string.Empty,
                request.Country ?? string.Empty);

            if (addressResult.IsFailure)
                return Result.Failure(addressResult.Error);

            address = addressResult.Value;
        }

        return user.UpdateProfile(request.FirstName, request.LastName, address);
    }
}
