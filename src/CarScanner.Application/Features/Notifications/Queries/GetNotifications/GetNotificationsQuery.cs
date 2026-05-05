using CarScanner.Application.Features.Notifications.Dtos;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Queries.GetNotifications;

public sealed record GetNotificationsQuery(
    bool UnreadOnly = false,
    int Page = 1,
    int PageSize = 20) : IQuery<Result<PagedResult<NotificationDto>>>;
