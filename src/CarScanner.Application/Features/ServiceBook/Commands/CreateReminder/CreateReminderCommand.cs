using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.CreateReminder;

public sealed record CreateReminderCommand(
    Guid VehicleId,
    ReminderType Type,
    DateOnly? DueDate,
    int? DueMileage,
    string Description) : ICommand<Result<CreateReminderCommandResult>>;

public sealed record CreateReminderCommandResult(Guid ReminderId);
