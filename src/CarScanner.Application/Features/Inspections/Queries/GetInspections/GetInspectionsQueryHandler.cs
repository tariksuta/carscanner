using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspections;

public sealed class GetInspectionsQueryHandler(IVehicleInspectionRepository inspectionRepository)
    : IQueryHandler<GetInspectionsQuery, Result<PagedResult<InspectionDto>>>
{
    public async Task<Result<PagedResult<InspectionDto>>> Handle(
        GetInspectionsQuery request,
        CancellationToken cancellationToken)
    {
        var inspections = await inspectionRepository.GetAllAsync(cancellationToken);
        var totalCount = inspections.Count;

        var items = inspections
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(i => new InspectionDto(
                i.Id,
                i.RentalId,
                i.VehicleId,
                i.EmployeeId,
                i.InspectionType,
                i.Status,
                i.CompletedAt,
                i.Notes))
            .ToList();

        return new PagedResult<InspectionDto>(items, request.Page, request.PageSize, totalCount);
    }
}
