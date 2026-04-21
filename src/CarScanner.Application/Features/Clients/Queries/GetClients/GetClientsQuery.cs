using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClients;

public sealed record GetClientsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null) : IQuery<Result<PagedResult<ClientDto>>>;

public sealed record ClientDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string DriverLicenseNumber,
    DateTime DriverLicenseExpiry,
    string DriverLicenseCountry,
    string? Address,
    string? City,
    DateOnly? BirthDate,
    string? Jmbg,
    bool IsVip,
    bool MarketingConsent,
    string? InternalNote,
    DateTime CreatedOnUtc,
    DateTime? ModifiedOnUtc);
