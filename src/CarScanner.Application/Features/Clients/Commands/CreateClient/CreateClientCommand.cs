using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Commands.CreateClient;

public sealed record CreateClientCommand(
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
    string? InternalNote) : ICommand<Result<CreateClientCommandResult>>;

public sealed record CreateClientCommandResult(Guid ClientId);
