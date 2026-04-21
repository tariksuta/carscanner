using CarScanner.Domain.Aggregates.DamageReportAggregate.Errors;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.DamageReports.Queries.GetDamageReportById;

public sealed class GetDamageReportByIdQueryHandler(IDamageReportRepository damageReportRepository)
    : IQueryHandler<GetDamageReportByIdQuery, Result<DamageReportDetailDto>>
{
    public async Task<Result<DamageReportDetailDto>> Handle(
        GetDamageReportByIdQuery request,
        CancellationToken cancellationToken)
    {
        var report = await damageReportRepository.GetWithDamageItemsAsync(request.DamageReportId, cancellationToken);
        if (report is null)
            return Result.Failure<DamageReportDetailDto>(DamageReportDomainErrors.NotFound(request.DamageReportId));

        var damageItems = report.DamageItems
            .Select(d => new DamageItemDto(
                d.Id,
                d.DamageReportId,
                d.Position,
                d.Description,
                d.Severity,
                d.EstimatedCost,
                d.PickupPhotoUrl,
                d.ReturnPhotoUrl))
            .ToList();

        return new DamageReportDetailDto(
            report.Id,
            report.RentalId,
            report.ClientId,
            report.PickupInspectionId,
            report.ReturnInspectionId,
            report.Status,
            report.RequestedAt,
            report.CompletedAt,
            report.HasDamages,
            report.TotalEstimatedCost,
            report.ErrorMessage,
            damageItems);
    }
}
