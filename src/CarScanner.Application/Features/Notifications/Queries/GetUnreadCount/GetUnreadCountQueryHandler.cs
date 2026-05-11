using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Queries.GetUnreadCount;

public sealed class GetUnreadCountQueryHandler(
    INotificationRepository notificationRepository)
    : IQueryHandler<GetUnreadCountQuery, Result<UnreadCountResult>>
{
    public async Task<Result<UnreadCountResult>> Handle(
        GetUnreadCountQuery request,
        CancellationToken cancellationToken)
    {
        var count = await notificationRepository.GetUnreadCountAsync(cancellationToken);
        return new UnreadCountResult(count);
    }
}
