using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Errors;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecordById;

public sealed class GetServiceRecordByIdQueryHandler(
    IServiceRecordRepository serviceRecordRepository,
    IVehicleRepository vehicleRepository)
    : IQueryHandler<GetServiceRecordByIdQuery, Result<ServiceRecordDetailDto>>
{
    public async Task<Result<ServiceRecordDetailDto>> Handle(
        GetServiceRecordByIdQuery request,
        CancellationToken cancellationToken)
    {
        var record = await serviceRecordRepository.GetByIdWithDocumentsAsync(
            request.ServiceRecordId, cancellationToken);

        if (record is null)
            return Result.Failure<ServiceRecordDetailDto>(
                ServiceBookDomainErrors.NotFound(request.ServiceRecordId));

        var vehicle = await vehicleRepository.GetByIdAsync(record.VehicleId, cancellationToken);
        var vehicleName = vehicle is null
            ? "—"
            : $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";

        var dto = new ServiceRecordDetailDto(
            record.Id,
            record.VehicleId,
            vehicleName,
            record.ServiceDate,
            record.MileageAtService,
            record.Type,
            record.Cost,
            record.Currency,
            record.Description,
            record.WorkshopName,
            record.WorkshopContact,
            record.CreatedByEmployeeId,
            record.CreatedOnUtc,
            record.Documents
                .Select(d => new ServiceDocumentDto(d.Url, d.FileName, d.ContentType, d.UploadedAtUtc))
                .ToList());

        return dto;
    }
}
