using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class ApplicationUserTokenConfiguration : IEntityTypeConfiguration<ApplicationUserToken>
{
    public void Configure(EntityTypeBuilder<ApplicationUserToken> builder)
    {
        builder.ToTable("ApplicationUserTokens");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Token)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(t => t.TokenType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.ExpiresOnUtc);

        builder.Property(t => t.UsedOnUtc);

        builder.Property(t => t.IsValid)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.ApplicationUserId)
            .IsRequired();

        builder.HasIndex(t => t.ApplicationUserId);
        builder.HasIndex(t => t.TokenType);
        builder.HasIndex(t => new { t.ApplicationUserId, t.TokenType });
    }
}
