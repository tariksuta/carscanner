using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Commands.UploadVehicleImage;

public sealed record UploadVehicleImageCommand(
    Guid VehicleId,
    Stream ImageStream,
    string FileName,
    string ContentType,
    bool IsPrimary) : ICommand<Result<UploadVehicleImageCommandResult>>;

public sealed record UploadVehicleImageCommandResult(Guid ImageId, string ImageUrl);
