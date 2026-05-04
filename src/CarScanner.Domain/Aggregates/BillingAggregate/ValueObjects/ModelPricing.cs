using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.ValueObjects;

public sealed class ModelPricing : ValueObject
{
    public const int MaxModelLength = 100;

    public string Model { get; private set; } = null!;
    public decimal PromptCostPerThousandTokens { get; private set; }
    public decimal CompletionCostPerThousandTokens { get; private set; }
    public decimal? FixedSurchargePerCall { get; private set; }

    private ModelPricing() { }

    public ModelPricing(
        string model,
        decimal promptCostPerThousandTokens,
        decimal completionCostPerThousandTokens,
        decimal? fixedSurchargePerCall = null)
    {
        Model = model;
        PromptCostPerThousandTokens = promptCostPerThousandTokens;
        CompletionCostPerThousandTokens = completionCostPerThousandTokens;
        FixedSurchargePerCall = fixedSurchargePerCall;
    }

    protected override IEnumerable<object?> GetAtomicValues()
    {
        yield return Model;
        yield return PromptCostPerThousandTokens;
        yield return CompletionCostPerThousandTokens;
        yield return FixedSurchargePerCall;
    }
}
