using CarScanner.Application.Features.Clients.Queries.GetClients;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClientById;

public sealed record GetClientByIdQuery(Guid ClientId) : IQuery<Result<ClientDto>>;
