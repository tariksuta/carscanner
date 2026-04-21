using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.DamageReports.Queries.GetDamageReportById;

public sealed record GetDamageReportByIdQuery(Guid DamageReportId) : IQuery<Result<DamageReportDetailDto>>;

public sealed record DamageReportDetailDto(
    Guid Id,
    Guid RentalId,
    Guid ClientId,
    Guid PickupInspectionId,
    Guid ReturnInspectionId,
    DamageReportStatus Status,
    DateTime RequestedAt,
    DateTime? CompletedAt,
    bool HasDamages,
    decimal? TotalEstimatedCost,
    string? ErrorMessage,
    IReadOnlyList<DamageItemDto> DamageItems);

public sealed record DamageItemDto(
    Guid Id,
    Guid DamageReportId,
    PhotoPosition Position,
    string Description,
    DamageSeverity Severity,
    decimal? EstimatedCost,
    string? PickupPhotoUrl,
    string? ReturnPhotoUrl);
