using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Services;

public interface IPricingCalculator
{
    decimal Estimate(int photoPairCount, PricingPlan plan, string model);

    Result<PricingResult> Compute(int promptTokens, int completionTokens, string model, PricingPlan plan);
}

public sealed record PricingResult(decimal RawCostUsd, decimal ChargedAmount);
