using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.UpdateVehicle;

public sealed record UpdateVehicleCommand(
    Guid VehicleId,
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Color,
    int CurrentMileage,
    FuelType Fuel,
    GearType Gear,
    int? PowerKw,
    int Seats,
    DateOnly? RegistrationExpiry,
    DateOnly? InsuranceExpiry,
    VehicleStatus Status) : ICommand<Result>;
