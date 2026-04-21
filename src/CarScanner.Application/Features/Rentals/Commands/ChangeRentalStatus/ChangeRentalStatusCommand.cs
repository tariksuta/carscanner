using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Rentals.Commands.ChangeRentalStatus;

public sealed record ChangeRentalStatusCommand(
    Guid RentalId,
    RentalStatus TargetStatus,
    Guid? EmployeeId,
    Guid? InspectionId,
    int? Mileage) : ICommand<Result>;
