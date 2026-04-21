using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.TenantId)
            .IsRequired();

        builder.Property(v => v.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(v => v.Model)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(v => v.Year)
            .IsRequired();

        builder.OwnsOne(v => v.LicensePlate, lp =>
        {
            lp.Property(x => x.Value)
                .HasColumnName("LicensePlate")
                .HasMaxLength(15)
                .IsRequired();

            lp.HasIndex(x => x.Value);
        });

        builder.Property(v => v.Vin)
            .HasMaxLength(17)
            .IsRequired();

        builder.HasIndex(v => v.Vin)
            .IsUnique();

        builder.Property(v => v.Color)
            .HasMaxLength(50);

        builder.Property(v => v.CurrentMileage)
            .IsRequired();

        builder.Property(v => v.Status)
            .IsRequired();

        builder.Property(v => v.RowVersion)
            .IsRowVersion();

        builder.HasMany(v => v.Images)
            .WithOne()
            .HasForeignKey(i => i.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(v => v.Images)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(v => v.TenantId);
        builder.HasIndex(v => v.Status);
    }
}
