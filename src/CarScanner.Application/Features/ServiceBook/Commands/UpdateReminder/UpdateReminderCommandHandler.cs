using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Errors;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.UpdateReminder;

public sealed class UpdateReminderCommandHandler(
    IMaintenanceReminderRepository reminderRepository)
    : ICommandHandler<UpdateReminderCommand, Result>
{
    public async Task<Result> Handle(UpdateReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await reminderRepository.GetByIdAsync(request.ReminderId, cancellationToken);
        if (reminder is null)
            return Result.Failure(MaintenanceReminderDomainErrors.NotFound(request.ReminderId));

        var result = reminder.Update(request.DueDate, request.DueMileage, request.Description);
        if (result.IsFailure)
            return result;

        reminderRepository.Update(reminder);
        return Result.Success();
    }
}
