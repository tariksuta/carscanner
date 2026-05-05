using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Notifications.Queries.GetUnreadCount;

public sealed record GetUnreadCountQuery() : IQuery<Result<UnreadCountResult>>;

public sealed record UnreadCountResult(int Count);
