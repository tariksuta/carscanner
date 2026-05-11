using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetPricingPlanById;

public sealed class GetPricingPlanByIdQueryHandler(
    IPricingPlanRepository pricingPlanRepository)
    : IQueryHandler<GetPricingPlanByIdQuery, Result<PricingPlanDetailDto>>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result<PricingPlanDetailDto>> Handle(
        GetPricingPlanByIdQuery request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure<PricingPlanDetailDto>(NotFound);

        var dto = new PricingPlanDetailDto(
            plan.Id,
            plan.Name,
            plan.IsDefault,
            plan.MarkupMultiplier,
            plan.EffectiveFromUtc,
            plan.EffectiveUntilUtc,
            plan.EnabledModules.Select(m => m.ToString()).ToList(),
            plan.ModelPricings
                .Select(p => new ModelPricingDto(
                    p.Model,
                    p.PromptCostPerThousandTokens,
                    p.CompletionCostPerThousandTokens,
                    p.FixedSurchargePerCall))
                .ToList());

        return Result.Success(dto);
    }
}
