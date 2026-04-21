using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Queries.GetVehicleById;

public sealed class GetVehicleByIdQueryHandler(IVehicleRepository vehicleRepository)
    : IQueryHandler<GetVehicleByIdQuery, Result<VehicleDetailDto>>
{
    public async Task<Result<VehicleDetailDto>> Handle(
        GetVehicleByIdQuery request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetWithImagesAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<VehicleDetailDto>(VehicleDomainErrors.NotFound(request.VehicleId));

        var images = vehicle.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new VehicleImageDto(i.Id, i.ImageUrl, i.IsPrimary, i.DisplayOrder))
            .ToList();

        return new VehicleDetailDto(
            vehicle.Id,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Year,
            vehicle.LicensePlate.Value,
            vehicle.Vin,
            vehicle.Color,
            vehicle.CurrentMileage,
            vehicle.Status,
            images);
    }
}
