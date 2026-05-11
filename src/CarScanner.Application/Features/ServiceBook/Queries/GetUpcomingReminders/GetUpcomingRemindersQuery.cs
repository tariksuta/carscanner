using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetUpcomingReminders;

public sealed record GetUpcomingRemindersQuery(
    int DaysAhead = 30) : IQuery<Result<IReadOnlyList<ReminderDto>>>;
