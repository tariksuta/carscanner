using CarScanner.Application.Features.Inspections.Queries.GetInspectionById;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.EnsureRentalInspection;

public sealed record EnsureRentalInspectionCommand(
    Guid RentalId,
    Guid EmployeeId,
    InspectionType InspectionType) : ICommand<Result<InspectionDetailDto>>;
