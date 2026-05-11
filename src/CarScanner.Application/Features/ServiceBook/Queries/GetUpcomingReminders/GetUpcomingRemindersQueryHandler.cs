using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetUpcomingReminders;

public sealed class GetUpcomingRemindersQueryHandler(
    IMaintenanceReminderRepository reminderRepository,
    IVehicleRepository vehicleRepository)
    : IQueryHandler<GetUpcomingRemindersQuery, Result<IReadOnlyList<ReminderDto>>>
{
    public async Task<Result<IReadOnlyList<ReminderDto>>> Handle(
        GetUpcomingRemindersQuery request,
        CancellationToken cancellationToken)
    {
        var daysAhead = request.DaysAhead < 1 ? 30 : Math.Min(request.DaysAhead, 365);
        var reminders = await reminderRepository.GetUpcomingAsync(daysAhead, cancellationToken);

        var vehicleIds = reminders.Select(r => r.VehicleId).Distinct().ToList();
        var vehicleNames = new Dictionary<Guid, string>();
        foreach (var vehicleId in vehicleIds)
        {
            var vehicle = await vehicleRepository.GetByIdAsync(vehicleId, cancellationToken);
            vehicleNames[vehicleId] = vehicle is null
                ? "—"
                : $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var dtos = reminders
            .Select(r => new ReminderDto(
                r.Id,
                r.VehicleId,
                vehicleNames.GetValueOrDefault(r.VehicleId, "—"),
                r.Type,
                r.DueDate,
                r.DueMileage,
                r.Description,
                r.IsActive,
                r.NotificationStage,
                r.LastNotificationSentAtUtc,
                r.DueDate.HasValue
                    ? (int)(r.DueDate.Value.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).TotalDays
                    : null))
            .ToList();

        return Result.Success<IReadOnlyList<ReminderDto>>(dtos);
    }
}
