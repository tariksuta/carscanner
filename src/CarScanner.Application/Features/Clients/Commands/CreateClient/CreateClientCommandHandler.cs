using CarScanner.Domain.Aggregates.ClientAggregate;
using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Commands.CreateClient;

public sealed class CreateClientCommandHandler(IClientRepository clientRepository)
    : ICommandHandler<CreateClientCommand, Result<CreateClientCommandResult>>
{
    public async Task<Result<CreateClientCommandResult>> Handle(
        CreateClientCommand request,
        CancellationToken cancellationToken)
    {
        var existingClient = await clientRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingClient is not null)
        {
            return Result.Failure<CreateClientCommandResult>(ClientDomainErrors.EmailAlreadyExists);
        }

        var clientResult = Client.Create(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.DriverLicenseNumber,
            request.DriverLicenseExpiry,
            request.DriverLicenseCountry,
            request.Address,
            request.City,
            request.BirthDate,
            request.Jmbg,
            request.IsVip,
            request.MarketingConsent,
            request.InternalNote);

        if (clientResult.IsFailure)
            return Result.Failure<CreateClientCommandResult>(clientResult.Error);

        clientRepository.Add(clientResult.Value);

        return new CreateClientCommandResult(clientResult.Value.Id);
    }
}
