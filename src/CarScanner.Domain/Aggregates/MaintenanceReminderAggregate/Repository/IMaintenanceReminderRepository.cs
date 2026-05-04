using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;

public interface IMaintenanceReminderRepository : IRepository<MaintenanceReminder, Guid>
{
    Task<IReadOnlyList<MaintenanceReminder>> GetByVehicleAsync(
        Guid vehicleId,
        bool includeInactive,
        CancellationToken cancellationToken = default);

    Task<MaintenanceReminder?> GetByVehicleAndTypeAsync(
        Guid vehicleId,
        ReminderType type,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MaintenanceReminder>> GetActiveDueWithinAsync(
        DateOnly today,
        int daysAhead,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MaintenanceReminder>> GetActiveMileageBasedAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MaintenanceReminder>> GetUpcomingAsync(
        int daysAhead,
        CancellationToken cancellationToken = default);
}
