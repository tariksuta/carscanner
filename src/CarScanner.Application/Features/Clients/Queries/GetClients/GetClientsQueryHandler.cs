using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClients;

public sealed class GetClientsQueryHandler(IClientRepository clientRepository)
    : IQueryHandler<GetClientsQuery, Result<PagedResult<ClientDto>>>
{
    public async Task<Result<PagedResult<ClientDto>>> Handle(
        GetClientsQuery request,
        CancellationToken cancellationToken)
    {
        var clients = await clientRepository.GetAllAsync(cancellationToken);

        var query = clients.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(c =>
                c.FirstName.ToLowerInvariant().Contains(search) ||
                c.LastName.ToLowerInvariant().Contains(search) ||
                c.Email.ToLowerInvariant().Contains(search));
        }

        var filtered = query.ToList();
        var totalCount = filtered.Count;

        var items = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new ClientDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.Email,
                c.Phone,
                c.DriverLicense.Number,
                c.DriverLicense.ExpiryDate,
                c.DriverLicense.IssuingCountry,
                c.Address,
                c.CreatedOnUtc,
                c.ModifiedOnUtc))
            .ToList();

        return new PagedResult<ClientDto>(items, request.Page, request.PageSize, totalCount);
    }
}
