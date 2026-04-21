using CarScanner.Domain.Aggregates.VehicleAggregate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class VehicleImageConfiguration : IEntityTypeConfiguration<VehicleImage>
{
    public void Configure(EntityTypeBuilder<VehicleImage> builder)
    {
        builder.ToTable("VehicleImages");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .ValueGeneratedNever();

        builder.Property(i => i.VehicleId)
            .IsRequired();

        builder.Property(i => i.ImageUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(i => i.IsPrimary)
            .IsRequired();

        builder.Property(i => i.DisplayOrder)
            .IsRequired();

        builder.Property(i => i.UploadedAt)
            .IsRequired();

        builder.Ignore(i => i.RowVersion);

        builder.HasIndex(i => i.VehicleId);
        builder.HasIndex(i => new { i.VehicleId, i.IsPrimary });
    }
}
