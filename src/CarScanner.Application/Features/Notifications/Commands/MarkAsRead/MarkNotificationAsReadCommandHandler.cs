using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Commands.MarkAsRead;

public sealed class MarkNotificationAsReadCommandHandler(
    INotificationRepository notificationRepository)
    : ICommandHandler<MarkNotificationAsReadCommand, Result>
{
    public async Task<Result> Handle(
        MarkNotificationAsReadCommand request,
        CancellationToken cancellationToken)
    {
        var notification = await notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification is null)
            return Result.Failure(new DomainError("Notification.NotFound", "Notification not found."));

        notification.MarkAsRead(DateTime.UtcNow);
        notificationRepository.Update(notification);
        return Result.Success();
    }
}
