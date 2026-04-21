using CarScanner.Domain.Aggregates.RentalAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class RentalConfiguration : IEntityTypeConfiguration<Rental>
{
    public void Configure(EntityTypeBuilder<Rental> builder)
    {
        builder.ToTable("Rentals");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.TenantId)
            .IsRequired();

        builder.Property(r => r.VehicleId)
            .IsRequired();

        builder.Property(r => r.ClientId)
            .IsRequired();

        builder.Property(r => r.PickupEmployeeId);
        builder.Property(r => r.ReturnEmployeeId);
        builder.Property(r => r.PickupInspectionId);
        builder.Property(r => r.ReturnInspectionId);

        builder.Property(r => r.PickupDate);
        builder.Property(r => r.ExpectedReturnDate).IsRequired();
        builder.Property(r => r.ActualReturnDate);

        builder.Property(r => r.PickupMileage);
        builder.Property(r => r.ReturnMileage);

        builder.Property(r => r.Status)
            .IsRequired();

        builder.Property(r => r.Notes)
            .HasMaxLength(2000);

        builder.Property(r => r.RowVersion)
            .IsRowVersion();

        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => r.VehicleId);
        builder.HasIndex(r => r.ClientId);
        builder.HasIndex(r => r.Status);
    }
}
