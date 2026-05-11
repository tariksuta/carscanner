using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Commands.MarkAllAsRead;

public sealed class MarkAllNotificationsAsReadCommandHandler(
    INotificationRepository notificationRepository)
    : ICommandHandler<MarkAllNotificationsAsReadCommand, Result>
{
    public async Task<Result> Handle(
        MarkAllNotificationsAsReadCommand request,
        CancellationToken cancellationToken)
    {
        await notificationRepository.MarkAllAsReadAsync(DateTime.UtcNow, cancellationToken);
        return Result.Success();
    }
}
