using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate;

public sealed class AiUsageRecord : AggregateRoot
{
    public const int MaxFeatureLength = 50;
    public const int MaxModelLength = 100;
    public const int MaxErrorContextLength = 2000;

    public Guid TenantId { get; private set; }
    public Guid BillingAccountId { get; private set; }
    public Guid? DamageReportId { get; private set; }
    public string Feature { get; private set; } = null!;
    public string Model { get; private set; } = null!;
    public int PromptTokens { get; private set; }
    public int CompletionTokens { get; private set; }
    public int TotalTokens { get; private set; }
    public decimal RawCostUsd { get; private set; }
    public decimal ChargedAmount { get; private set; }
    public Guid? ReservationId { get; private set; }
    public AiUsageStatus Status { get; private set; }
    public string? ErrorContext { get; private set; }
    public Guid? OriginalUsageRecordId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private AiUsageRecord() { }

    private AiUsageRecord(
        Guid tenantId,
        Guid billingAccountId,
        Guid? damageReportId,
        string feature,
        string model,
        int promptTokens,
        int completionTokens,
        decimal rawCostUsd,
        decimal chargedAmount,
        Guid? reservationId,
        AiUsageStatus status,
        string? errorContext,
        Guid? originalUsageRecordId,
        DateTime createdAtUtc) : base()
    {
        TenantId = tenantId;
        BillingAccountId = billingAccountId;
        DamageReportId = damageReportId;
        Feature = feature;
        Model = model;
        PromptTokens = promptTokens;
        CompletionTokens = completionTokens;
        TotalTokens = promptTokens + completionTokens;
        RawCostUsd = rawCostUsd;
        ChargedAmount = chargedAmount;
        ReservationId = reservationId;
        Status = status;
        ErrorContext = errorContext;
        OriginalUsageRecordId = originalUsageRecordId;
        CreatedAtUtc = createdAtUtc;
    }

    public static AiUsageRecord Committed(
        Guid tenantId,
        Guid billingAccountId,
        Guid? damageReportId,
        string feature,
        string model,
        int promptTokens,
        int completionTokens,
        decimal rawCostUsd,
        decimal chargedAmount,
        Guid reservationId,
        DateTime createdAtUtc)
    {
        return new AiUsageRecord(
            tenantId,
            billingAccountId,
            damageReportId,
            feature,
            model,
            promptTokens,
            completionTokens,
            rawCostUsd,
            chargedAmount,
            reservationId,
            AiUsageStatus.Committed,
            errorContext: null,
            originalUsageRecordId: null,
            createdAtUtc);
    }

    public static AiUsageRecord EstimatedFallback(
        Guid tenantId,
        Guid billingAccountId,
        Guid? damageReportId,
        string feature,
        string model,
        decimal chargedAmount,
        Guid reservationId,
        string errorContext,
        DateTime createdAtUtc)
    {
        return new AiUsageRecord(
            tenantId,
            billingAccountId,
            damageReportId,
            feature,
            model,
            promptTokens: 0,
            completionTokens: 0,
            rawCostUsd: 0m,
            chargedAmount,
            reservationId,
            AiUsageStatus.EstimatedFallback,
            errorContext,
            originalUsageRecordId: null,
            createdAtUtc);
    }

    public static AiUsageRecord Refunded(
        Guid tenantId,
        Guid billingAccountId,
        Guid? damageReportId,
        string feature,
        string model,
        Guid reservationId,
        string? errorContext,
        DateTime createdAtUtc)
    {
        return new AiUsageRecord(
            tenantId,
            billingAccountId,
            damageReportId,
            feature,
            model,
            promptTokens: 0,
            completionTokens: 0,
            rawCostUsd: 0m,
            chargedAmount: 0m,
            reservationId,
            AiUsageStatus.Refunded,
            errorContext,
            originalUsageRecordId: null,
            createdAtUtc);
    }

    public static AiUsageRecord CompensatingRefund(
        AiUsageRecord original,
        decimal refundAmount,
        string reason,
        DateTime createdAtUtc)
    {
        return new AiUsageRecord(
            original.TenantId,
            original.BillingAccountId,
            original.DamageReportId,
            original.Feature,
            original.Model,
            promptTokens: 0,
            completionTokens: 0,
            rawCostUsd: 0m,
            chargedAmount: -Math.Abs(refundAmount),
            reservationId: null,
            AiUsageStatus.Refunded,
            errorContext: reason,
            originalUsageRecordId: original.Id,
            createdAtUtc);
    }
}
