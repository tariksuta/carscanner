using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Errors;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.DismissReminder;

public sealed class DismissReminderCommandHandler(
    IMaintenanceReminderRepository reminderRepository)
    : ICommandHandler<DismissReminderCommand, Result>
{
    public async Task<Result> Handle(DismissReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await reminderRepository.GetByIdAsync(request.ReminderId, cancellationToken);
        if (reminder is null)
            return Result.Failure(MaintenanceReminderDomainErrors.NotFound(request.ReminderId));

        var result = reminder.Dismiss();
        if (result.IsFailure)
            return result;

        reminderRepository.Update(reminder);
        return Result.Success();
    }
}
