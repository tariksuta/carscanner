using CarScanner.Application.Features.Inspections.Queries.GetInspectionById;
using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspectionByRental;

public sealed class GetInspectionByRentalQueryHandler(IVehicleInspectionRepository inspectionRepository)
    : IQueryHandler<GetInspectionByRentalQuery, Result<InspectionDetailDto>>
{
    public async Task<Result<InspectionDetailDto>> Handle(
        GetInspectionByRentalQuery request,
        CancellationToken cancellationToken)
    {
        var inspection = await inspectionRepository.GetByRentalIdAndTypeAsync(
            request.RentalId, request.InspectionType, cancellationToken);

        if (inspection is null)
            return Result.Failure<InspectionDetailDto>(InspectionDomainErrors.NotFound(Guid.Empty));

        var photos = inspection.Photos
            .Select(p => new InspectionPhotoDto(p.Id, p.InspectionId, p.Position, p.PhotoUrl, p.TakenAt))
            .ToList();

        return new InspectionDetailDto(
            inspection.Id,
            inspection.RentalId,
            inspection.VehicleId,
            inspection.EmployeeId,
            inspection.InspectionType,
            inspection.Status,
            inspection.CompletedAt,
            inspection.Notes,
            photos);
    }
}
