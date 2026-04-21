using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Commands.UpdateClient;

public sealed record UpdateClientCommand(
    Guid ClientId,
    string FirstName,
    string LastName,
    string Phone,
    string? Address,
    string DriverLicenseNumber,
    DateTime DriverLicenseExpiry,
    string DriverLicenseCountry) : ICommand<Result>;
