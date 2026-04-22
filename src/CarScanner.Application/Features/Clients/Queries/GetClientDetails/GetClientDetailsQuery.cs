using CarScanner.Application.Features.Clients.Queries.GetClients;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClientDetails;

public sealed record GetClientDetailsQuery(Guid ClientId) : IQuery<Result<ClientDetailsDto>>;

public sealed record ClientDetailsDto(
    ClientDto Client,
    ClientStatsDto Stats,
    IReadOnlyList<ClientRentalRowDto> RecentRentals,
    IReadOnlyList<ClientActivityItemDto> Activity);

public sealed record ClientStatsDto(
    int TotalRentals,
    double AverageDurationDays,
    int DamageCount,
    decimal TotalSpent,
    DateTime? LastRentalDate);

public sealed record ClientRentalRowDto(
    Guid Id,
    string VehicleLabel,
    string LicensePlate,
    DateTime? PickupDate,
    DateTime? ActualReturnDate,
    DateTime ExpectedReturnDate,
    RentalStatus Status,
    decimal Price,
    bool HasDamage);

public enum ClientActivityType
{
    RentalCreated = 0,
    RentalStarted = 1,
    RentalCompleted = 2,
    DamageDetected = 3,
}

public sealed record ClientActivityItemDto(
    DateTime Timestamp,
    ClientActivityType Type,
    string Title,
    string Subtitle,
    Guid? RelatedRentalId);
