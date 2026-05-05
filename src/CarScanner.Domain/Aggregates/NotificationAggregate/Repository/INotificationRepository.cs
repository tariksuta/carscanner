using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.NotificationAggregate.Repository;

public interface INotificationRepository : IRepository<Notification, Guid>
{
    Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetPagedAsync(
        bool unreadOnly,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Notification>> GetUnreadAsync(
        int limit,
        CancellationToken cancellationToken = default);

    Task MarkAllAsReadAsync(DateTime nowUtc, CancellationToken cancellationToken = default);
}
