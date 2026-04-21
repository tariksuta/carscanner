using CarScanner.Domain.Aggregates.InspectionAggregate.Errors;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspectionById;

public sealed class GetInspectionByIdQueryHandler(IVehicleInspectionRepository inspectionRepository)
    : IQueryHandler<GetInspectionByIdQuery, Result<InspectionDetailDto>>
{
    public async Task<Result<InspectionDetailDto>> Handle(
        GetInspectionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var inspection = await inspectionRepository.GetWithPhotosAsync(request.InspectionId, cancellationToken);
        if (inspection is null)
            return Result.Failure<InspectionDetailDto>(InspectionDomainErrors.NotFound(request.InspectionId));

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
