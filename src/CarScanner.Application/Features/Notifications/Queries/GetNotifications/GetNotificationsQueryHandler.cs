using CarScanner.Application.Features.Notifications.Dtos;
using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Queries.GetNotifications;

public sealed class GetNotificationsQueryHandler(
    INotificationRepository notificationRepository)
    : IQueryHandler<GetNotificationsQuery, Result<PagedResult<NotificationDto>>>
{
    public async Task<Result<PagedResult<NotificationDto>>> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var (items, totalCount) = await notificationRepository.GetPagedAsync(
            request.UnreadOnly, page, pageSize, cancellationToken);

        var dtos = items
            .Select(n => new NotificationDto(
                n.Id,
                n.Type,
                n.Title,
                n.Message,
                n.Severity,
                n.RelatedEntityType,
                n.RelatedEntityId,
                n.IsRead,
                n.ReadAtUtc,
                n.CreatedOnUtc))
            .ToList();

        return new PagedResult<NotificationDto>(dtos, page, pageSize, totalCount);
    }
}
