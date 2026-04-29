using CarScanner.Domain.Aggregates.TenantAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.Name)
            .HasMaxLength(Tenant.MaxNameLength)
            .IsRequired();

        builder.Property(t => t.ContactEmail)
            .HasMaxLength(Tenant.MaxEmailLength)
            .IsRequired();

        builder.Property(t => t.Status)
            .IsRequired();

        builder.Property(t => t.ProvisionedAt)
            .IsRequired();

        builder.Property(t => t.SuspensionReason)
            .HasMaxLength(Tenant.MaxSuspensionReasonLength);

        builder.Property(t => t.RowVersion)
            .IsRowVersion();

        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.ContactEmail);
    }
}
