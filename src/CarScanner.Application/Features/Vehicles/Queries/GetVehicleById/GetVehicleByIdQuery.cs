using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Queries.GetVehicleById;

public sealed record GetVehicleByIdQuery(Guid VehicleId) : IQuery<Result<VehicleDetailDto>>;

public sealed record VehicleDetailDto(
    Guid Id,
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Vin,
    string Color,
    int CurrentMileage,
    VehicleStatus Status,
    IReadOnlyList<VehicleImageDto> Images);

public sealed record VehicleImageDto(
    Guid Id,
    string ImageUrl,
    bool IsPrimary,
    int DisplayOrder);
