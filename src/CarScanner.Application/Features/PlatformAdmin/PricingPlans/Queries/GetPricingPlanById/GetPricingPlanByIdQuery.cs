using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetPricingPlanById;

public sealed record GetPricingPlanByIdQuery(Guid PricingPlanId) : IQuery<Result<PricingPlanDetailDto>>;

public sealed record PricingPlanDetailDto(
    Guid Id,
    string Name,
    bool IsDefault,
    decimal MarkupMultiplier,
    DateTime EffectiveFromUtc,
    DateTime? EffectiveUntilUtc,
    IReadOnlyList<string> EnabledModules,
    IReadOnlyList<ModelPricingDto> ModelPricings);

public sealed record ModelPricingDto(
    string Model,
    decimal PromptCostPerThousandTokens,
    decimal CompletionCostPerThousandTokens,
    decimal? FixedSurchargePerCall);
