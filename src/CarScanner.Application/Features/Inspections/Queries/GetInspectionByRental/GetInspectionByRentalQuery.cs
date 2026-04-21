using CarScanner.Application.Features.Inspections.Queries.GetInspectionById;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Queries.GetInspectionByRental;

public sealed record GetInspectionByRentalQuery(
    Guid RentalId,
    InspectionType InspectionType) : IQuery<Result<InspectionDetailDto>>;
