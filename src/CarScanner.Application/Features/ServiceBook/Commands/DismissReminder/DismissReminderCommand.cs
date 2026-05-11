using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.DismissReminder;

public sealed record DismissReminderCommand(Guid ReminderId) : ICommand<Result>;
