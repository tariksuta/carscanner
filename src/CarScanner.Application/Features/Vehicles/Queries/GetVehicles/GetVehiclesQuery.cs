using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Queries.GetVehicles;

public sealed record GetVehiclesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    bool OnlyAvailable = false) : IQuery<Result<PagedResult<VehicleDto>>>;

public sealed record VehicleDto(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Vin,
    string Color,
    int CurrentMileage,
    VehicleStatus Status,
    string? PrimaryImageUrl);
