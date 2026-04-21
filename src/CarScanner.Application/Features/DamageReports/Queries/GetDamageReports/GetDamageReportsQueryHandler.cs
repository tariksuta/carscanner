using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.DamageReports.Queries.GetDamageReports;

public sealed class GetDamageReportsQueryHandler(IDamageReportRepository damageReportRepository)
    : IQueryHandler<GetDamageReportsQuery, Result<PagedResult<DamageReportDto>>>
{
    public async Task<Result<PagedResult<DamageReportDto>>> Handle(
        GetDamageReportsQuery request,
        CancellationToken cancellationToken)
    {
        var reports = await damageReportRepository.GetAllAsync(cancellationToken);
        var totalCount = reports.Count;

        var items = reports
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new DamageReportDto(
                r.Id,
                r.RentalId,
                r.ClientId,
                r.PickupInspectionId,
                r.ReturnInspectionId,
                r.Status,
                r.RequestedAt,
                r.CompletedAt,
                r.HasDamages,
                r.TotalEstimatedCost))
            .ToList();

        return new PagedResult<DamageReportDto>(items, request.Page, request.PageSize, totalCount);
    }
}
