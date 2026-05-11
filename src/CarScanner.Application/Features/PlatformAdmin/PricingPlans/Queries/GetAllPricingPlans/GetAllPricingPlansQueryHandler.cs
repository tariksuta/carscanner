using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetAllPricingPlans;

public sealed class GetAllPricingPlansQueryHandler(
    IPricingPlanRepository pricingPlanRepository)
    : IQueryHandler<GetAllPricingPlansQuery, Result<IReadOnlyList<PricingPlanSummaryDto>>>
{
    public async Task<Result<IReadOnlyList<PricingPlanSummaryDto>>> Handle(
        GetAllPricingPlansQuery request,
        CancellationToken cancellationToken)
    {
        var plans = await pricingPlanRepository.GetAllAsync(cancellationToken);

        var items = plans
            .Select(p => new PricingPlanSummaryDto(
                p.Id,
                p.Name,
                p.IsDefault,
                p.MarkupMultiplier,
                p.EffectiveFromUtc,
                p.EffectiveUntilUtc,
                p.EnabledModules.Count,
                p.ModelPricings.Count))
            .ToList();

        return Result.Success<IReadOnlyList<PricingPlanSummaryDto>>(items);
    }
}
