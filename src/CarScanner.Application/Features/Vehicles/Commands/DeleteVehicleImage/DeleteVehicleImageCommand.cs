using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.DeleteVehicleImage;

public sealed record DeleteVehicleImageCommand(
    Guid VehicleId,
    Guid ImageId) : ICommand<Result>;
