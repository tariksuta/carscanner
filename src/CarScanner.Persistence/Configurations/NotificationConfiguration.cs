using CarScanner.Domain.Aggregates.NotificationAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id).ValueGeneratedNever();
        builder.Property(n => n.TenantId).IsRequired();

        builder.Property(n => n.Type)
            .HasMaxLength(Notification.MaxTypeLength)
            .IsRequired();

        builder.Property(n => n.Title)
            .HasMaxLength(Notification.MaxTitleLength)
            .IsRequired();

        builder.Property(n => n.Message)
            .HasMaxLength(Notification.MaxMessageLength)
            .IsRequired();

        builder.Property(n => n.Severity).IsRequired();

        builder.Property(n => n.RelatedEntityType)
            .HasMaxLength(Notification.MaxRelatedEntityTypeLength);

        builder.Property(n => n.RelatedEntityId);
        builder.Property(n => n.IsRead).IsRequired();
        builder.Property(n => n.ReadAtUtc);
        builder.Property(n => n.RowVersion).IsRowVersion();

        builder.HasIndex(n => n.TenantId);
        builder.HasIndex(n => new { n.TenantId, n.IsRead, n.CreatedOnUtc });
    }
}
