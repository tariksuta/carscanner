using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.DamageReports.Queries.GetDamageReports;

public sealed record GetDamageReportsQuery(
    int Page = 1,
    int PageSize = 10) : IQuery<Result<PagedResult<DamageReportDto>>>;

public sealed record DamageReportDto(
    Guid Id,
    Guid RentalId,
    Guid ClientId,
    Guid PickupInspectionId,
    Guid ReturnInspectionId,
    DamageReportStatus Status,
    DateTime RequestedAt,
    DateTime? CompletedAt,
    bool HasDamages,
    decimal? TotalEstimatedCost);
