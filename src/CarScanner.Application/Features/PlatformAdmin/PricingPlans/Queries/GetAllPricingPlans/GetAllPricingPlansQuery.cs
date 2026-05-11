using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetAllPricingPlans;

public sealed record GetAllPricingPlansQuery() : IQuery<Result<IReadOnlyList<PricingPlanSummaryDto>>>;

public sealed record PricingPlanSummaryDto(
    Guid Id,
    string Name,
    bool IsDefault,
    decimal MarkupMultiplier,
    DateTime EffectiveFromUtc,
    DateTime? EffectiveUntilUtc,
    int EnabledModuleCount,
    int ModelPricingCount);
