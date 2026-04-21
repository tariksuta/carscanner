using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.CreateVehicle;

public sealed record CreateVehicleCommand(
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Vin,
    string Color,
    int CurrentMileage,
    FuelType Fuel,
    GearType Gear,
    int? PowerKw,
    int Seats,
    DateOnly? RegistrationExpiry,
    DateOnly? InsuranceExpiry) : ICommand<Result<CreateVehicleCommandResult>>;

public sealed record CreateVehicleCommandResult(Guid VehicleId);
