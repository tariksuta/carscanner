using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.UpdateReminder;

public sealed record UpdateReminderCommand(
    Guid ReminderId,
    DateOnly? DueDate,
    int? DueMileage,
    string Description) : ICommand<Result>;
