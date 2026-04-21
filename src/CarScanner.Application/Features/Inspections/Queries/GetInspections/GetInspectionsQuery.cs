using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspections;

public sealed record GetInspectionsQuery(
    int Page = 1,
    int PageSize = 10) : IQuery<Result<PagedResult<InspectionDto>>>;

public sealed record InspectionDto(
    Guid Id,
    Guid RentalId,
    Guid VehicleId,
    Guid EmployeeId,
    InspectionType InspectionType,
    InspectionStatus Status,
    DateTime? CompletedAt,
    string? Notes);
