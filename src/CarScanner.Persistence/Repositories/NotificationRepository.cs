using CarScanner.Domain.Aggregates.NotificationAggregate;
using CarScanner.Domain.Aggregates.NotificationAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class NotificationRepository(ApplicationDbContext dbContext)
    : Repository<Notification, Guid>(dbContext), INotificationRepository
{
    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetPagedAsync(
        bool unreadOnly,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedOnUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<int> GetUnreadCountAsync(CancellationToken cancellationToken = default)
    {
        return DbSet.CountAsync(n => !n.IsRead, cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetUnreadAsync(
        int limit,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(n => !n.IsRead)
            .OrderByDescending(n => n.CreatedOnUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(DateTime nowUtc, CancellationToken cancellationToken = default)
    {
        var unread = await DbSet.Where(n => !n.IsRead).ToListAsync(cancellationToken);
        foreach (var n in unread)
            n.MarkAsRead(nowUtc);
    }
}
