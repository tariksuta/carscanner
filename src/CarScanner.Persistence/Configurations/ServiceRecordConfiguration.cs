using CarScanner.Domain.Aggregates.ServiceBookAggregate;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class ServiceRecordConfiguration : IEntityTypeConfiguration<ServiceRecord>
{
    public void Configure(EntityTypeBuilder<ServiceRecord> builder)
    {
        builder.ToTable("ServiceRecords");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.TenantId).IsRequired();
        builder.Property(r => r.VehicleId).IsRequired();
        builder.Property(r => r.ServiceDate).IsRequired();
        builder.Property(r => r.MileageAtService).IsRequired();
        builder.Property(r => r.Type).IsRequired();

        builder.Property(r => r.Cost)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(r => r.Currency)
            .HasMaxLength(ServiceRecord.MaxCurrencyLength)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasMaxLength(ServiceRecord.MaxDescriptionLength)
            .IsRequired();

        builder.Property(r => r.WorkshopName)
            .HasMaxLength(ServiceRecord.MaxWorkshopNameLength);

        builder.Property(r => r.WorkshopContact)
            .HasMaxLength(ServiceRecord.MaxWorkshopContactLength);

        builder.Property(r => r.CreatedByEmployeeId);

        builder.Property(r => r.RowVersion).IsRowVersion();

        builder.OwnsMany(r => r.Documents, d =>
        {
            d.ToTable("ServiceRecordDocuments");
            d.WithOwner().HasForeignKey("ServiceRecordId");
            d.Property<Guid>("Id").ValueGeneratedOnAdd();
            d.HasKey("Id");

            d.Property(x => x.Url).HasMaxLength(2048).IsRequired();
            d.Property(x => x.FileName).HasMaxLength(500).IsRequired();
            d.Property(x => x.ContentType).HasMaxLength(200).IsRequired();
            d.Property(x => x.UploadedAtUtc).IsRequired();
        });

        builder.Navigation(r => r.Documents)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => new { r.VehicleId, r.ServiceDate })
            .IsDescending(false, true);
    }
}
