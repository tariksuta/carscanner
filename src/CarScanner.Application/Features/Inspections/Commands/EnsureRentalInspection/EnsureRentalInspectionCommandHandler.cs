using CarScanner.Application.Features.Inspections.Queries.GetInspectionById;
using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Inspections.Commands.EnsureRentalInspection;

public sealed class EnsureRentalInspectionCommandHandler(
    IVehicleInspectionRepository inspectionRepository,
    IRentalRepository rentalRepository)
    : ICommandHandler<EnsureRentalInspectionCommand, Result<InspectionDetailDto>>
{
    public async Task<Result<InspectionDetailDto>> Handle(
        EnsureRentalInspectionCommand request,
        CancellationToken cancellationToken)
    {
        var existing = await inspectionRepository.GetByRentalIdAndTypeAsync(
            request.RentalId, request.InspectionType, cancellationToken);

        if (existing is not null)
            return MapToDto(existing);

        var rental = await rentalRepository.GetByIdAsync(request.RentalId, cancellationToken);
        if (rental is null)
            return Result.Failure<InspectionDetailDto>(RentalDomainErrors.NotFound(request.RentalId));

        if (request.InspectionType == InspectionType.Pickup)
        {
            var startResult = rental.StartPickupInspection(request.EmployeeId);
            if (startResult.IsFailure)
                return Result.Failure<InspectionDetailDto>(startResult.Error);
        }
        else
        {
            var startResult = rental.StartReturnInspection(request.EmployeeId);
            if (startResult.IsFailure)
                return Result.Failure<InspectionDetailDto>(startResult.Error);
        }

        var inspectionResult = VehicleInspection.Create(
            request.RentalId,
            rental.VehicleId,
            request.EmployeeId,
            request.InspectionType);

        if (inspectionResult.IsFailure)
            return Result.Failure<InspectionDetailDto>(inspectionResult.Error);

        inspectionRepository.Add(inspectionResult.Value);

        return MapToDto(inspectionResult.Value);
    }

    private static InspectionDetailDto MapToDto(VehicleInspection inspection)
    {
        var photos = inspection.Photos
            .Select(p => new InspectionPhotoDto(p.Id, p.InspectionId, p.Position, p.PhotoUrl, p.TakenAt))
            .ToList();

        return new InspectionDetailDto(
            inspection.Id,
            inspection.RentalId,
            inspection.VehicleId,
            inspection.EmployeeId,
            inspection.InspectionType,
            inspection.Status,
            inspection.CompletedAt,
            inspection.Notes,
            photos);
    }
}
