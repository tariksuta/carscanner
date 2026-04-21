using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspectionById;

public sealed record GetInspectionByIdQuery(Guid InspectionId) : IQuery<Result<InspectionDetailDto>>;

public sealed record InspectionDetailDto(
    Guid Id,
    Guid RentalId,
    Guid VehicleId,
    Guid EmployeeId,
    InspectionType InspectionType,
    InspectionStatus Status,
    DateTime? CompletedAt,
    string? Notes,
    IReadOnlyList<InspectionPhotoDto> Photos);

public sealed record InspectionPhotoDto(
    Guid Id,
    Guid InspectionId,
    PhotoPosition Position,
    string PhotoUrl,
    DateTime TakenAt);
