using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Services;

public sealed class PricingCalculator : IPricingCalculator
{
    private const int CostScale = 4;

    private const int FloorEstimatedPromptTokens = 3000;
    private const int FloorEstimatedCompletionTokens = 1000;
    private const int EstimatedPromptTokensPerPair = 750;
    private const int EstimatedCompletionTokensPerPair = 100;

    public decimal Estimate(int photoPairCount, PricingPlan plan, string model)
    {
        if (photoPairCount < 0) photoPairCount = 0;

        var prompt = Math.Max(FloorEstimatedPromptTokens, photoPairCount * EstimatedPromptTokensPerPair);
        var completion = Math.Max(FloorEstimatedCompletionTokens, photoPairCount * EstimatedCompletionTokensPerPair);

        var computed = Compute(prompt, completion, model, plan);
        return computed.IsSuccess ? computed.Value.ChargedAmount : 0m;
    }

    public Result<PricingResult> Compute(int promptTokens, int completionTokens, string model, PricingPlan plan)
    {
        if (promptTokens < 0 || completionTokens < 0)
            return Result.Failure<PricingResult>(BillingDomainErrors.InvalidTokenCount);

        var pricing = plan.GetPricingFor(model);
        if (pricing is null)
            return Result.Failure<PricingResult>(BillingDomainErrors.UnknownModel);

        var rawCost =
            (promptTokens / 1000m) * pricing.PromptCostPerThousandTokens
            + (completionTokens / 1000m) * pricing.CompletionCostPerThousandTokens
            + (pricing.FixedSurchargePerCall ?? 0m);

        var charged = rawCost * plan.MarkupMultiplier;

        return new PricingResult(
            decimal.Round(rawCost, CostScale, MidpointRounding.AwayFromZero),
            decimal.Round(charged, CostScale, MidpointRounding.AwayFromZero));
    }
}
