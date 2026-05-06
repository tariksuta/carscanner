using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpsertModelPricing;

public sealed record UpsertModelPricingCommand(
    Guid PricingPlanId,
    string Model,
    decimal PromptCostPerThousandTokens,
    decimal CompletionCostPerThousandTokens,
    decimal? FixedSurchargePerCall) : ICommand<Result>;
