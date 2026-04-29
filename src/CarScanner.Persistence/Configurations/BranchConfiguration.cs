using CarScanner.Domain.Aggregates.BranchAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.Property(b => b.Name)
            .HasMaxLength(Branch.MaxNameLength)
            .IsRequired();

        builder.Property(b => b.City)
            .HasMaxLength(Branch.MaxCityLength)
            .IsRequired();

        builder.Property(b => b.Address)
            .HasMaxLength(Branch.MaxAddressLength);

        builder.Property(b => b.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(b => b.RowVersion)
            .IsRowVersion();

        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => b.IsActive);
        builder.HasIndex(b => new { b.TenantId, b.City, b.Name });
    }
}
