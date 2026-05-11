using CarScanner.Domain.Aggregates.MaintenanceReminderAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class MaintenanceReminderConfiguration : IEntityTypeConfiguration<MaintenanceReminder>
{
    public void Configure(EntityTypeBuilder<MaintenanceReminder> builder)
    {
        builder.ToTable("MaintenanceReminders");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.TenantId).IsRequired();
        builder.Property(r => r.VehicleId).IsRequired();
        builder.Property(r => r.Type).IsRequired();

        builder.Property(r => r.DueDate);
        builder.Property(r => r.DueMileage);

        builder.Property(r => r.Description)
            .HasMaxLength(MaintenanceReminder.MaxDescriptionLength)
            .IsRequired();

        builder.Property(r => r.IsActive).IsRequired();
        builder.Property(r => r.LastNotificationSentAtUtc);
        builder.Property(r => r.NotificationStage).IsRequired();

        builder.Property(r => r.RowVersion).IsRowVersion();

        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => new { r.VehicleId, r.Type });
        builder.HasIndex(r => new { r.IsActive, r.DueDate });
        builder.HasIndex(r => new { r.IsActive, r.DueMileage });
    }
}
