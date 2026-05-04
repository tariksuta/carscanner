using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate.Repository;
using CarScanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class MaintenanceReminderRepository(ApplicationDbContext dbContext)
    : Repository<MaintenanceReminder, Guid>(dbContext), IMaintenanceReminderRepository
{
    public async Task<IReadOnlyList<MaintenanceReminder>> GetByVehicleAsync(
        Guid vehicleId,
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(r => r.VehicleId == vehicleId);
        if (!includeInactive)
            query = query.Where(r => r.IsActive);

        return await query
            .OrderBy(r => r.DueDate ?? DateOnly.MaxValue)
            .ThenBy(r => r.DueMileage ?? int.MaxValue)
            .ToListAsync(cancellationToken);
    }

    public async Task<MaintenanceReminder?> GetByVehicleAndTypeAsync(
        Guid vehicleId,
        ReminderType type,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(r => r.VehicleId == vehicleId && r.Type == type, cancellationToken);
    }

    public async Task<IReadOnlyList<MaintenanceReminder>> GetActiveDueWithinAsync(
        DateOnly today,
        int daysAhead,
        CancellationToken cancellationToken = default)
    {
        var threshold = today.AddDays(daysAhead);
        return await DbSet
            .IgnoreQueryFilters()
            .Where(r => r.IsActive && !r.IsDeleted && r.DueDate != null && r.DueDate <= threshold)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MaintenanceReminder>> GetActiveMileageBasedAsync(
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .IgnoreQueryFilters()
            .Where(r => r.IsActive && !r.IsDeleted && r.DueMileage != null)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MaintenanceReminder>> GetUpcomingAsync(
        int daysAhead,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var threshold = today.AddDays(daysAhead);
        return await DbSet
            .Where(r => r.IsActive && r.DueDate != null && r.DueDate <= threshold)
            .OrderBy(r => r.DueDate)
            .ToListAsync(cancellationToken);
    }
}
