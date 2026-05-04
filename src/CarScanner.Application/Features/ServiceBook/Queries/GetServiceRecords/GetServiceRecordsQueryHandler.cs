using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecords;

public sealed class GetServiceRecordsQueryHandler(
    IServiceRecordRepository serviceRecordRepository,
    IVehicleRepository vehicleRepository)
    : IQueryHandler<GetServiceRecordsQuery, Result<PagedResult<ServiceRecordSummaryDto>>>
{
    public async Task<Result<PagedResult<ServiceRecordSummaryDto>>> Handle(
        GetServiceRecordsQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var (records, totalCount) = await serviceRecordRepository.GetPagedAsync(
            request.VehicleId, page, pageSize, cancellationToken);

        var vehicleIds = records.Select(r => r.VehicleId).Distinct().ToList();
        var vehicleNames = new Dictionary<Guid, string>();
        foreach (var vehicleId in vehicleIds)
        {
            var vehicle = await vehicleRepository.GetByIdAsync(vehicleId, cancellationToken);
            vehicleNames[vehicleId] = vehicle is null
                ? "—"
                : $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";
        }

        var items = records
            .Select(r => new ServiceRecordSummaryDto(
                r.Id,
                r.VehicleId,
                vehicleNames.GetValueOrDefault(r.VehicleId, "—"),
                r.ServiceDate,
                r.MileageAtService,
                r.Type,
                r.Cost,
                r.Currency,
                r.WorkshopName))
            .ToList();

        return new PagedResult<ServiceRecordSummaryDto>(items, page, pageSize, totalCount);
    }
}
