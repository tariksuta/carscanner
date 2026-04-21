using CarScanner.Domain.Aggregates.DamageReportAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class DamageReportConfiguration : IEntityTypeConfiguration<DamageReport>
{
    public void Configure(EntityTypeBuilder<DamageReport> builder)
    {
        builder.ToTable("DamageReports");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.RentalId)
            .IsRequired();

        builder.Property(d => d.ClientId)
            .IsRequired();

        builder.Property(d => d.PickupInspectionId)
            .IsRequired();

        builder.Property(d => d.ReturnInspectionId)
            .IsRequired();

        builder.Property(d => d.Status)
            .IsRequired();

        builder.Property(d => d.RequestedAt)
            .IsRequired();

        builder.Property(d => d.CompletedAt);

        builder.Property(d => d.AiRawResponse);

        builder.Property(d => d.ErrorMessage)
            .HasMaxLength(1000);

        builder.HasMany(d => d.DamageItems)
            .WithOne()
            .HasForeignKey(di => di.DamageReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(d => d.DamageItems)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(d => d.RowVersion)
            .IsRowVersion();

        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => d.RentalId);
        builder.HasIndex(d => d.Status);
    }
}

public sealed class DamageItemConfiguration : IEntityTypeConfiguration<DamageItem>
{
    public void Configure(EntityTypeBuilder<DamageItem> builder)
    {
        builder.ToTable("DamageItems");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .ValueGeneratedNever();

        builder.Property(d => d.DamageReportId)
            .IsRequired();

        builder.Property(d => d.Position)
            .IsRequired();

        builder.Property(d => d.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(d => d.Severity)
            .IsRequired();

        builder.Property(d => d.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(d => d.PickupPhotoUrl)
            .HasMaxLength(500);

        builder.Property(d => d.ReturnPhotoUrl)
            .HasMaxLength(500);

        builder.Ignore(d => d.RowVersion);

        builder.HasIndex(d => d.DamageReportId);
    }
}
