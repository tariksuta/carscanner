using CarScanner.Domain.Aggregates.ClientAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("Clients");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(c => c.Email);

        builder.Property(c => c.Phone)
            .HasMaxLength(20)
            .IsRequired();

        builder.OwnsOne(c => c.DriverLicense, dl =>
        {
            dl.Property(x => x.Number)
                .HasColumnName("DriverLicenseNumber")
                .HasMaxLength(50)
                .IsRequired();

            dl.Property(x => x.ExpiryDate)
                .HasColumnName("DriverLicenseExpiry")
                .IsRequired();

            dl.Property(x => x.IssuingCountry)
                .HasColumnName("DriverLicenseCountry")
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.City)
            .HasMaxLength(100);

        builder.Property(c => c.BirthDate);

        builder.Property(c => c.Jmbg)
            .HasMaxLength(13);

        builder.Property(c => c.IsVip)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(c => c.MarketingConsent)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(c => c.InternalNote)
            .HasMaxLength(2000);

        builder.Property(c => c.RowVersion)
            .IsRowVersion();

        builder.HasIndex(c => c.TenantId);
    }
}
