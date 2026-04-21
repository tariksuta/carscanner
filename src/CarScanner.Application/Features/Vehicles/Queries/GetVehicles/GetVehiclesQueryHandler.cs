using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Vehicles.Queries.GetVehicles;

public sealed class GetVehiclesQueryHandler(IVehicleRepository vehicleRepository)
    : IQueryHandler<GetVehiclesQuery, Result<PagedResult<VehicleDto>>>
{
    public async Task<Result<PagedResult<VehicleDto>>> Handle(
        GetVehiclesQuery request,
        CancellationToken cancellationToken)
    {
        var vehicles = request.OnlyAvailable
            ? await vehicleRepository.GetAvailableVehiclesWithPrimaryImageAsync(cancellationToken)
            : await vehicleRepository.GetAllWithPrimaryImageAsync(cancellationToken);

        var query = vehicles.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(v =>
                v.Brand.ToLowerInvariant().Contains(search) ||
                v.Model.ToLowerInvariant().Contains(search) ||
                v.LicensePlate.Value.ToLowerInvariant().Contains(search));
        }

        var filtered = query.ToList();
        var totalCount = filtered.Count;

        var items = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(v => new VehicleDto(
                v.Id,
                v.Brand,
                v.Model,
                v.Year,
                v.LicensePlate.Value,
                v.Vin,
                v.Color,
                v.CurrentMileage,
                v.Status,
                v.GetPrimaryImage()?.ImageUrl))
            .ToList();

        return new PagedResult<VehicleDto>(items, request.Page, request.PageSize, totalCount);
    }
}
