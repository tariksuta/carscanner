using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.CreateReminder;

public sealed class CreateReminderCommandHandler(
    ITenantProvider tenantProvider,
    IVehicleRepository vehicleRepository,
    IMaintenanceReminderRepository reminderRepository)
    : ICommandHandler<CreateReminderCommand, Result<CreateReminderCommandResult>>
{
    public async Task<Result<CreateReminderCommandResult>> Handle(
        CreateReminderCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<CreateReminderCommandResult>(VehicleDomainErrors.NotFound(request.VehicleId));

        var result = MaintenanceReminder.Create(
            tenantProvider.TenantId,
            request.VehicleId,
            request.Type,
            request.DueDate,
            request.DueMileage,
            request.Description);

        if (result.IsFailure)
            return Result.Failure<CreateReminderCommandResult>(result.Error);

        reminderRepository.Add(result.Value);
        return new CreateReminderCommandResult(result.Value.Id);
    }
}
