using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetRemindersForVehicle;

public sealed class GetRemindersForVehicleQueryHandler(
    IMaintenanceReminderRepository reminderRepository,
    IVehicleRepository vehicleRepository)
    : IQueryHandler<GetRemindersForVehicleQuery, Result<IReadOnlyList<ReminderDto>>>
{
    public async Task<Result<IReadOnlyList<ReminderDto>>> Handle(
        GetRemindersForVehicleQuery request,
        CancellationToken cancellationToken)
    {
        var reminders = await reminderRepository.GetByVehicleAsync(
            request.VehicleId, request.IncludeInactive, cancellationToken);

        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        var vehicleName = vehicle is null
            ? "—"
            : $"{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate.Value})";

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var dtos = reminders
            .Select(r => new ReminderDto(
                r.Id,
                r.VehicleId,
                vehicleName,
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
