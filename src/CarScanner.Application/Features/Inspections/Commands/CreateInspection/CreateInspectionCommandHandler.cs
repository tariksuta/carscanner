using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.CreateInspection;

public sealed class CreateInspectionCommandHandler(
    IVehicleInspectionRepository inspectionRepository,
    IRentalRepository rentalRepository)
    : ICommandHandler<CreateInspectionCommand, Result<CreateInspectionCommandResult>>
{
    public async Task<Result<CreateInspectionCommandResult>> Handle(
        CreateInspectionCommand request,
        CancellationToken cancellationToken)
    {
        var rental = await rentalRepository.GetByIdAsync(request.RentalId, cancellationToken);
        if (rental is null)
            return Result.Failure<CreateInspectionCommandResult>(RentalDomainErrors.NotFound(request.RentalId));

        if (request.InspectionType == InspectionType.Pickup)
        {
            var startResult = rental.StartPickupInspection(request.EmployeeId);
            if (startResult.IsFailure)
                return Result.Failure<CreateInspectionCommandResult>(startResult.Error);
        }
        else
        {
            var startResult = rental.StartReturnInspection(request.EmployeeId);
            if (startResult.IsFailure)
                return Result.Failure<CreateInspectionCommandResult>(startResult.Error);
        }

        var inspectionResult = VehicleInspection.Create(
            request.RentalId,
            rental.VehicleId,
            request.EmployeeId,
            request.InspectionType);

        if (inspectionResult.IsFailure)
            return Result.Failure<CreateInspectionCommandResult>(inspectionResult.Error);

        inspectionRepository.Add(inspectionResult.Value);

        return new CreateInspectionCommandResult(inspectionResult.Value.Id);
    }
}
