using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.CreateInspection;

public sealed record CreateInspectionCommand(
    Guid RentalId,
    Guid EmployeeId,
    InspectionType InspectionType) : ICommand<Result<CreateInspectionCommandResult>>;

public sealed record CreateInspectionCommandResult(Guid InspectionId);
