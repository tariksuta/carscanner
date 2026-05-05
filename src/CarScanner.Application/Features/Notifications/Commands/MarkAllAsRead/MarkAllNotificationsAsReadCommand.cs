using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Commands.MarkAllAsRead;

public sealed record MarkAllNotificationsAsReadCommand() : ICommand<Result>;
