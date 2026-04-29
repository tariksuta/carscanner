using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.ValueObjects;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate;

public sealed class PricingPlan : AggregateRoot
{
    public const int MaxNameLength = 100;
    public const decimal MinMarkup = 1.0m;

    private readonly List<ModelPricing> _modelPricings = [];

    public string Name { get; private set; } = null!;
    public bool IsDefault { get; private set; }
    public decimal MarkupMultiplier { get; private set; }
    public DateTime EffectiveFromUtc { get; private set; }
    public DateTime? EffectiveUntilUtc { get; private set; }

    public IReadOnlyCollection<ModelPricing> ModelPricings => _modelPricings.AsReadOnly();

    private PricingPlan() { }

    private PricingPlan(string name, bool isDefault, decimal markup, DateTime effectiveFromUtc) : base()
    {
        Name = name;
        IsDefault = isDefault;
        MarkupMultiplier = markup;
        EffectiveFromUtc = effectiveFromUtc;
    }

    public static Result<PricingPlan> Create(string name, decimal markupMultiplier, bool isDefault = false)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<PricingPlan>(BillingDomainErrors.InvalidPricingPlanName);

        if (name.Trim().Length > MaxNameLength)
            return Result.Failure<PricingPlan>(BillingDomainErrors.PricingPlanNameTooLong);

        if (markupMultiplier < MinMarkup)
            return Result.Failure<PricingPlan>(BillingDomainErrors.InvalidMarkup);

        return new PricingPlan(name.Trim(), isDefault, markupMultiplier, DateTime.UtcNow);
    }

    public Result UpsertModelPricing(
        string model,
        decimal promptCostPerThousandTokens,
        decimal completionCostPerThousandTokens,
        decimal? fixedSurchargePerCall = null)
    {
        if (string.IsNullOrWhiteSpace(model))
            return Result.Failure(BillingDomainErrors.InvalidModelName);

        if (model.Trim().Length > ModelPricing.MaxModelLength)
            return Result.Failure(BillingDomainErrors.ModelNameTooLong);

        if (promptCostPerThousandTokens < 0 || completionCostPerThousandTokens < 0)
            return Result.Failure(BillingDomainErrors.InvalidPricingCost);

        if (fixedSurchargePerCall.HasValue && fixedSurchargePerCall.Value < 0)
            return Result.Failure(BillingDomainErrors.InvalidPricingCost);

        var trimmedModel = model.Trim();
        _modelPricings.RemoveAll(p => p.Model == trimmedModel);
        _modelPricings.Add(new ModelPricing(
            trimmedModel,
            promptCostPerThousandTokens,
            completionCostPerThousandTokens,
            fixedSurchargePerCall));

        return Result.Success();
    }

    public void RemoveModelPricing(string model)
    {
        _modelPricings.RemoveAll(p => p.Model == model);
    }

    public ModelPricing? GetPricingFor(string model) =>
        _modelPricings.FirstOrDefault(p => p.Model == model);

    public Result UpdateMarkup(decimal markupMultiplier)
    {
        if (markupMultiplier < MinMarkup)
            return Result.Failure(BillingDomainErrors.InvalidMarkup);

        MarkupMultiplier = markupMultiplier;
        return Result.Success();
    }

    public void Supersede(DateTime nowUtc)
    {
        EffectiveUntilUtc = nowUtc;
        IsDefault = false;
    }

    public void MarkAsDefault()
    {
        IsDefault = true;
    }

    public void ClearDefault()
    {
        IsDefault = false;
    }
}
