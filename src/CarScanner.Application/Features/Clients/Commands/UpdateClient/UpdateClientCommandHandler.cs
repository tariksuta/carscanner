using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Commands.UpdateClient;

public sealed class UpdateClientCommandHandler(
    IClientRepository clientRepository)
    : ICommandHandler<UpdateClientCommand, Result>
{
    public async Task<Result> Handle(
        UpdateClientCommand request,
        CancellationToken cancellationToken)
    {
        var client = await clientRepository.GetByIdAsync(request.ClientId, cancellationToken);
        if (client is null)
            return Result.Failure(ClientDomainErrors.NotFound(request.ClientId));

        var updateResult = client.Update(
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Address,
            request.City,
            request.BirthDate,
            request.Jmbg,
            request.IsVip,
            request.MarketingConsent,
            request.InternalNote);

        if (updateResult.IsFailure)
            return updateResult;

        var licenseResult = client.UpdateDriverLicense(
            request.DriverLicenseNumber,
            request.DriverLicenseExpiry,
            request.DriverLicenseCountry);

        if (licenseResult.IsFailure)
            return licenseResult;

        return Result.Success();
    }
}
