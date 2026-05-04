using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Billing.Queries.GetMyUsage;

public sealed record GetMyUsageQuery(
    DateTime? FromUtc = null,
    DateTime? ToUtc = null,
    int Page = 1,
    int PageSize = 20)
    : IQuery<Result<PagedResult<AiUsageRecordDto>>>;

public sealed record AiUsageRecordDto(
    Guid Id,
    Guid? DamageReportId,
    string Feature,
    string Model,
    int PromptTokens,
    int CompletionTokens,
    int TotalTokens,
    decimal RawCostUsd,
    decimal ChargedAmount,
    AiUsageStatus Status,
    string? ErrorContext,
    Guid? OriginalUsageRecordId,
    DateTime CreatedAtUtc);
