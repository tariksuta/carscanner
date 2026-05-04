using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Billing.Queries.GetMyUsage;

public sealed class GetMyUsageQueryHandler(
    IAiUsageRecordRepository usageRepo,
    ITenantProvider tenantProvider)
    : IQueryHandler<GetMyUsageQuery, Result<PagedResult<AiUsageRecordDto>>>
{
    private static readonly DomainError MissingTenantContext =
        new("Billing.MissingTenantContext", "Tenant context is missing on the request.");

    public async Task<Result<PagedResult<AiUsageRecordDto>>> Handle(
        GetMyUsageQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return Result.Failure<PagedResult<AiUsageRecordDto>>(MissingTenantContext);

        var nowUtc = DateTime.UtcNow;
        var fromUtc = request.FromUtc ?? nowUtc.AddDays(-30);
        var toUtc = request.ToUtc ?? nowUtc.AddSeconds(1);

        var records = await usageRepo.GetForTenantAsync(tenantId, fromUtc, toUtc, cancellationToken);

        var totalCount = records.Count;
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 200);

        var items = records
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AiUsageRecordDto(
                r.Id,
                r.DamageReportId,
                r.Feature,
                r.Model,
                r.PromptTokens,
                r.CompletionTokens,
                r.TotalTokens,
                r.RawCostUsd,
                r.ChargedAmount,
                r.Status,
                r.ErrorContext,
                r.OriginalUsageRecordId,
                r.CreatedAtUtc))
            .ToList();

        return new PagedResult<AiUsageRecordDto>(items, page, pageSize, totalCount);
    }
}
