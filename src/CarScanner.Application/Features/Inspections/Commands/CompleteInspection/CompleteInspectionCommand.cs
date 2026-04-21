using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.CompleteInspection;

public sealed record CompleteInspectionCommand(
    Guid InspectionId,
    int CurrentMileage) : ICommand<Result<CompleteInspectionCommandResult>>;

public sealed record CompleteInspectionCommandResult(Guid InspectionId, bool IsReturnInspection);
