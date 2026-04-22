using CarScanner.Application.Features.Clients.Queries.GetClients;
using CarScanner.Domain.Aggregates.ClientAggregate.Errors;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.Domain.Aggregates.DamageReportAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Clients.Queries.GetClientDetails;

public sealed class GetClientDetailsQueryHandler(
    IClientRepository clientRepository,
    IRentalRepository rentalRepository,
    IDamageReportRepository damageReportRepository,
    IVehicleRepository vehicleRepository)
    : IQueryHandler<GetClientDetailsQuery, Result<ClientDetailsDto>>
{
    private const int RecentRentalsLimit = 10;
    private const int ActivityLimit = 10;

    public async Task<Result<ClientDetailsDto>> Handle(
        GetClientDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var client = await clientRepository.GetByIdAsync(request.ClientId, cancellationToken);
        if (client is null)
            return Result.Failure<ClientDetailsDto>(ClientDomainErrors.NotFound(request.ClientId));

        var rentals = await rentalRepository.GetByClientIdAsync(request.ClientId, cancellationToken);
        var damageReports = await damageReportRepository.GetByClientIdAsync(request.ClientId, cancellationToken);

        var vehicleIds = rentals.Select(r => r.VehicleId).Distinct().ToList();
        var vehicleMap = new Dictionary<Guid, Vehicle>();
        foreach (var vehicleId in vehicleIds)
        {
            var vehicle = await vehicleRepository.GetByIdAsync(vehicleId, cancellationToken);
            if (vehicle is not null)
                vehicleMap[vehicleId] = vehicle;
        }

        var rentalsWithDamage = damageReports
            .Where(d => d.Status == DamageReportStatus.DamageDetected)
            .Select(d => d.RentalId)
            .ToHashSet();

        var clientDto = MapClient(client);
        var stats = BuildStats(rentals, damageReports);
        var recentRentals = BuildRecentRentals(rentals, vehicleMap, rentalsWithDamage);
        var activity = BuildActivity(rentals, damageReports, vehicleMap);

        return new ClientDetailsDto(clientDto, stats, recentRentals, activity);
    }

    private static ClientDto MapClient(Domain.Aggregates.ClientAggregate.Client client) =>
        new(
            client.Id,
            client.FirstName,
            client.LastName,
            client.Email,
            client.Phone,
            client.DriverLicense.Number,
            client.DriverLicense.ExpiryDate,
            client.DriverLicense.IssuingCountry,
            client.Address,
            client.City,
            client.BirthDate,
            client.Jmbg,
            client.IsVip,
            client.MarketingConsent,
            client.InternalNote,
            client.CreatedOnUtc,
            client.ModifiedOnUtc);

    private static ClientStatsDto BuildStats(
        IReadOnlyList<Rental> rentals,
        IReadOnlyList<DamageReport> damageReports)
    {
        var completed = rentals
            .Where(r => r.PickupDate.HasValue && r.ActualReturnDate.HasValue)
            .ToList();

        var averageDurationDays = completed.Count == 0
            ? 0d
            : completed.Average(r => (r.ActualReturnDate!.Value - r.PickupDate!.Value).TotalDays);

        var damageCount = damageReports.Count(d => d.Status == DamageReportStatus.DamageDetected);
        var totalSpent = rentals.Sum(r => r.Price);

        DateTime? lastRentalDate = rentals.Count == 0
            ? null
            : rentals
                .Select(r => r.ActualReturnDate ?? r.PickupDate ?? r.CreatedOnUtc)
                .Max();

        return new ClientStatsDto(
            rentals.Count,
            Math.Round(averageDurationDays, 1),
            damageCount,
            totalSpent,
            lastRentalDate);
    }

    private static IReadOnlyList<ClientRentalRowDto> BuildRecentRentals(
        IReadOnlyList<Rental> rentals,
        IReadOnlyDictionary<Guid, Vehicle> vehicleMap,
        HashSet<Guid> rentalsWithDamage)
    {
        return rentals
            .OrderByDescending(r => r.PickupDate ?? r.CreatedOnUtc)
            .Take(RecentRentalsLimit)
            .Select(r =>
            {
                vehicleMap.TryGetValue(r.VehicleId, out var vehicle);
                var label = vehicle is null ? "—" : $"{vehicle.Brand} {vehicle.Model}";
                var plate = vehicle?.LicensePlate.Value ?? string.Empty;
                return new ClientRentalRowDto(
                    r.Id,
                    label,
                    plate,
                    r.PickupDate,
                    r.ActualReturnDate,
                    r.ExpectedReturnDate,
                    r.Status,
                    r.Price,
                    rentalsWithDamage.Contains(r.Id));
            })
            .ToList();
    }

    private static IReadOnlyList<ClientActivityItemDto> BuildActivity(
        IReadOnlyList<Rental> rentals,
        IReadOnlyList<DamageReport> damageReports,
        IReadOnlyDictionary<Guid, Vehicle> vehicleMap)
    {
        var items = new List<ClientActivityItemDto>();

        foreach (var rental in rentals)
        {
            var subtitle = BuildVehicleSubtitle(rental.VehicleId, vehicleMap);

            items.Add(new ClientActivityItemDto(
                rental.CreatedOnUtc,
                ClientActivityType.RentalCreated,
                "Rental rezervisan",
                subtitle,
                rental.Id));

            if (rental.PickupDate.HasValue)
            {
                items.Add(new ClientActivityItemDto(
                    rental.PickupDate.Value,
                    ClientActivityType.RentalStarted,
                    "Rental započet",
                    subtitle,
                    rental.Id));
            }

            if (rental.ActualReturnDate.HasValue)
            {
                items.Add(new ClientActivityItemDto(
                    rental.ActualReturnDate.Value,
                    ClientActivityType.RentalCompleted,
                    "Rental završen",
                    subtitle,
                    rental.Id));
            }
        }

        foreach (var report in damageReports)
        {
            if (report.Status != DamageReportStatus.DamageDetected || !report.CompletedAt.HasValue)
                continue;

            var relatedRental = rentals.FirstOrDefault(r => r.Id == report.RentalId);
            var subtitle = relatedRental is null
                ? "Šteta evidentirana"
                : BuildVehicleSubtitle(relatedRental.VehicleId, vehicleMap);

            items.Add(new ClientActivityItemDto(
                report.CompletedAt.Value,
                ClientActivityType.DamageDetected,
                "Šteta detektovana",
                subtitle,
                report.RentalId));
        }

        return items
            .OrderByDescending(i => i.Timestamp)
            .Take(ActivityLimit)
            .ToList();
    }

    private static string BuildVehicleSubtitle(Guid vehicleId, IReadOnlyDictionary<Guid, Vehicle> vehicleMap)
    {
        if (!vehicleMap.TryGetValue(vehicleId, out var vehicle))
            return "—";

        return $"{vehicle.Brand} {vehicle.Model} · {vehicle.LicensePlate.Value}";
    }
}
