using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.SetPrimaryVehicleImage;

public sealed record SetPrimaryVehicleImageCommand(
    Guid VehicleId,
    Guid ImageId) : ICommand<Result>;
