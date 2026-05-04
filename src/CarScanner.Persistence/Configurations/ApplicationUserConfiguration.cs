using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("ApplicationUsers");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.TenantId);
        builder.HasIndex(u => u.TenantId);

        builder.Property(u => u.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.NormalizedEmail)
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(u => u.NormalizedEmail)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(u => u.FirstName)
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .HasMaxLength(100);

        builder.Property(u => u.Role)
            .HasMaxLength(50);

        builder.OwnsOne(u => u.Address, a =>
        {
            a.Property(x => x.Street)
                .HasColumnName("Address_Street")
                .HasMaxLength(200);

            a.Property(x => x.City)
                .HasColumnName("Address_City")
                .HasMaxLength(100);

            a.Property(x => x.ZipCode)
                .HasColumnName("Address_ZipCode")
                .HasMaxLength(20);

            a.Property(x => x.Country)
                .HasColumnName("Address_Country")
                .HasMaxLength(100);
        });

        builder.Property(u => u.ProfileImageUrl)
            .HasMaxLength(500);

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.LastSignInOnUtc);

        builder.Property(u => u.RowVersion)
            .IsRowVersion();

        // Configure relationship with tokens
        builder.HasMany(u => u.Tokens)
            .WithOne(t => t.ApplicationUser)
            .HasForeignKey(t => t.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(u => u.Tokens)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
