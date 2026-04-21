using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class VehicleInspectionConfiguration : IEntityTypeConfiguration<VehicleInspection>
{
    public void Configure(EntityTypeBuilder<VehicleInspection> builder)
    {
        builder.ToTable("VehicleInspections");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.RentalId)
            .IsRequired();

        builder.Property(i => i.VehicleId)
            .IsRequired();

        builder.Property(i => i.EmployeeId)
            .IsRequired();

        builder.Property(i => i.InspectionType)
            .IsRequired();

        builder.Property(i => i.Status)
            .IsRequired();

        builder.Property(i => i.CompletedAt);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        builder.HasMany(i => i.Photos)
            .WithOne()
            .HasForeignKey(p => p.InspectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(i => i.Photos)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(i => i.RowVersion)
            .IsRowVersion();

        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.RentalId);
        builder.HasIndex(i => i.VehicleId);
    }
}

public sealed class InspectionPhotoConfiguration : IEntityTypeConfiguration<InspectionPhoto>
{
    public void Configure(EntityTypeBuilder<InspectionPhoto> builder)
    {
        builder.ToTable("InspectionPhotos");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.InspectionId)
            .IsRequired();

        builder.Property(p => p.Position)
            .IsRequired();

        builder.Property(p => p.PhotoUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.TakenAt)
            .IsRequired();

        builder.Ignore(p => p.RowVersion);

        builder.HasIndex(p => new { p.InspectionId, p.Position });
    }
}
