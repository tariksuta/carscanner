using CarScanner.Application.Features.Notifications.Commands.MarkAllAsRead;
using CarScanner.Application.Features.Notifications.Commands.MarkAsRead;
using CarScanner.Application.Features.Notifications.Queries.GetNotifications;
using CarScanner.Application.Features.Notifications.Queries.GetUnreadCount;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Notifications;

public static class NotificationsEndpoints
{
    public static IEndpointRouteBuilder MapNotificationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications")
            .WithTags("Notifications")
            .RequireAuthorization();

        group.MapGet("/", GetNotifications);
        group.MapGet("/unread-count", GetUnreadCount);
        group.MapPost("/{id:guid}/mark-read", MarkAsRead);
        group.MapPost("/mark-all-read", MarkAllAsRead);

        return app;
    }

    private static async Task<IResult> GetNotifications(
        ISender sender,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetNotificationsQuery(unreadOnly, page, pageSize), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetUnreadCount(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetUnreadCountQuery(), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.BadRequest(error));
    }

    private static async Task<IResult> MarkAsRead(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new MarkNotificationAsReadCommand(id), cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }

    private static async Task<IResult> MarkAllAsRead(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new MarkAllNotificationsAsReadCommand(), cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }
}
