using CarScanner.Domain.Aggregates.BillingAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarScanner.Persistence.Configurations;

public sealed class AiUsageRecordConfiguration : IEntityTypeConfiguration<AiUsageRecord>
{
    public void Configure(EntityTypeBuilder<AiUsageRecord> builder)
    {
        builder.ToTable("AiUsageRecords");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.BillingAccountId)
            .IsRequired();

        builder.Property(a => a.DamageReportId);

        builder.Property(a => a.Feature)
            .HasMaxLength(AiUsageRecord.MaxFeatureLength)
            .IsRequired();

        builder.Property(a => a.Model)
            .HasMaxLength(AiUsageRecord.MaxModelLength)
            .IsRequired();

        builder.Property(a => a.PromptTokens)
            .IsRequired();

        builder.Property(a => a.CompletionTokens)
            .IsRequired();

        builder.Property(a => a.TotalTokens)
            .IsRequired();

        builder.Property(a => a.RawCostUsd)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(a => a.ChargedAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(a => a.ReservationId);

        builder.Property(a => a.Status)
            .IsRequired();

        builder.Property(a => a.ErrorContext)
            .HasMaxLength(AiUsageRecord.MaxErrorContextLength);

        builder.Property(a => a.OriginalUsageRecordId);

        builder.Property(a => a.CreatedAtUtc)
            .IsRequired();

        builder.Property(a => a.RowVersion)
            .IsRowVersion();

        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => a.BillingAccountId);
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.CreatedAtUtc);
        builder.HasIndex(a => a.DamageReportId);
        builder.HasIndex(a => new { a.TenantId, a.CreatedAtUtc });
    }
}
