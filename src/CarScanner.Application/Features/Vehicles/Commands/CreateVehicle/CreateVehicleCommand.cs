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
    int CurrentMileage) : ICommand<Result<CreateVehicleCommandResult>>;

public sealed record CreateVehicleCommandResult(Guid VehicleId);
