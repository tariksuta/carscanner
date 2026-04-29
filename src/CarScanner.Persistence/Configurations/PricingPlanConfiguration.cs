using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class PricingPlanConfiguration : IEntityTypeConfiguration<PricingPlan>
{
    public void Configure(EntityTypeBuilder<PricingPlan> builder)
    {
        builder.ToTable("PricingPlans");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.Name)
            .HasMaxLength(PricingPlan.MaxNameLength)
            .IsRequired();

        builder.Property(p => p.IsDefault)
            .IsRequired();

        builder.Property(p => p.MarkupMultiplier)
            .HasPrecision(8, 4)
            .IsRequired();

        builder.Property(p => p.EffectiveFromUtc)
            .IsRequired();

        builder.Property(p => p.EffectiveUntilUtc);

        builder.Property(p => p.RowVersion)
            .IsRowVersion();

        builder.OwnsMany(p => p.ModelPricings, mp =>
        {
            mp.ToTable("PricingPlanModelPricings");
            mp.WithOwner().HasForeignKey("PricingPlanId");
            mp.Property<Guid>("Id").ValueGeneratedOnAdd();
            mp.HasKey("Id");

            mp.Property(m => m.Model)
                .HasMaxLength(ModelPricing.MaxModelLength)
                .IsRequired();

            mp.Property(m => m.PromptCostPerThousandTokens)
                .HasPrecision(18, 8)
                .IsRequired();

            mp.Property(m => m.CompletionCostPerThousandTokens)
                .HasPrecision(18, 8)
                .IsRequired();

            mp.Property(m => m.FixedSurchargePerCall)
                .HasPrecision(18, 8);

            mp.HasIndex("PricingPlanId", nameof(ModelPricing.Model)).IsUnique();
        });

        builder.Navigation(p => p.ModelPricings)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(p => p.IsDefault);
        builder.HasIndex(p => new { p.IsDefault, p.EffectiveUntilUtc });
    }
}
