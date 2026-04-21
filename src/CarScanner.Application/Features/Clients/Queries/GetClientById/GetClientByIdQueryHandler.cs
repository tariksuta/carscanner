using CarScanner.Application.Features.Clients.Queries.GetClients;
using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClientById;

public sealed class GetClientByIdQueryHandler(IClientRepository clientRepository)
    : IQueryHandler<GetClientByIdQuery, Result<ClientDto>>
{
    public async Task<Result<ClientDto>> Handle(
        GetClientByIdQuery request,
        CancellationToken cancellationToken)
    {
        var client = await clientRepository.GetByIdAsync(request.ClientId, cancellationToken);
        if (client is null)
            return Result.Failure<ClientDto>(ClientDomainErrors.NotFound(request.ClientId));

        return new ClientDto(
            client.Id,
            client.FirstName,
            client.LastName,
            client.Email,
            client.Phone,
            client.DriverLicense.Number,
            client.DriverLicense.ExpiryDate,
            client.DriverLicense.IssuingCountry,
            client.Address,
            client.CreatedOnUtc,
            client.ModifiedOnUtc);
    }
}
