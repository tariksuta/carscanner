using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.ValueObjects;
using CarScanner.SharedKernel.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
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

        var modulesComparer = new ValueComparer<IReadOnlyCollection<Module>>(
            (a, b) => (a ?? Array.Empty<Module>()).OrderBy(m => m).SequenceEqual((b ?? Array.Empty<Module>()).OrderBy(m => m)),
            c => c.Aggregate(0, (h, m) => HashCode.Combine(h, m.GetHashCode())),
            c => (IReadOnlyCollection<Module>)c.ToHashSet());

        var modulesProp = builder.Property(p => p.EnabledModules)
            .HasColumnName("EnabledModules")
            .HasColumnType("nvarchar(500)")
            .HasConversion(
                v => SerializeModules(v),
                v => DeserializeModules(v))
            .IsRequired();
        modulesProp.Metadata.SetValueComparer(modulesComparer);
        modulesProp.Metadata.SetField("_enabledModules");
        modulesProp.Metadata.SetPropertyAccessMode(PropertyAccessMode.Field);

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

    private static string SerializeModules(IReadOnlyCollection<Module> modules) =>
        string.Join(',', modules.Select(m => m.ToString()));

    private static IReadOnlyCollection<Module> DeserializeModules(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return new HashSet<Module>();

        var splitOptions = StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries;
        var parts = value.Split(',', splitOptions);
        var result = new HashSet<Module>(parts.Length);
        foreach (var part in parts)
        {
            if (Enum.TryParse<Module>(part, true, out var module))
                result.Add(module);
        }
        return result;
    }
}
