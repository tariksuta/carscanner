using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class BillingAccountConfiguration : IEntityTypeConfiguration<BillingAccount>
{
    public void Configure(EntityTypeBuilder<BillingAccount> builder)
    {
        builder.ToTable("BillingAccounts");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.HasIndex(b => b.TenantId)
            .IsUnique();

        builder.Property(b => b.Currency)
            .HasMaxLength(BillingAccount.MaxCurrencyLength)
            .IsRequired();

        builder.Property(b => b.Balance)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(b => b.LifetimeToppedUp)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(b => b.LifetimeSpent)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(b => b.MonthlyHardCap)
            .HasPrecision(18, 4);

        builder.Property(b => b.MonthSpent)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(b => b.MonthAnchorUtc)
            .IsRequired();

        builder.Property(b => b.LowBalanceThreshold)
            .HasPrecision(18, 4);

        builder.Property(b => b.LowBalanceAlertSentForCurrentDip)
            .IsRequired();

        builder.Property(b => b.CurrentPricingPlanId);

        builder.Property(b => b.RowVersion)
            .IsRowVersion();

        builder.HasMany(b => b.Reservations)
            .WithOne()
            .HasForeignKey(r => r.BillingAccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(b => b.Reservations)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("BillingReservations");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .ValueGeneratedNever();

        builder.Property(r => r.BillingAccountId)
            .IsRequired();

        builder.Property(r => r.Amount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(r => r.Status)
            .IsRequired();

        builder.Property(r => r.CreatedAtUtc)
            .IsRequired();

        builder.Property(r => r.CompletedAtUtc);

        builder.Property(r => r.ActualCost)
            .HasPrecision(18, 4);

        builder.Ignore(r => r.RowVersion);

        builder.HasIndex(r => r.BillingAccountId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.CreatedAtUtc);
    }
}
