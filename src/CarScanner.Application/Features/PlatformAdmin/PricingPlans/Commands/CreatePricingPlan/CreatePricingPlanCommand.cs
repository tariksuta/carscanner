using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.CreatePricingPlan;

public sealed record CreatePricingPlanCommand(
    string Name,
    decimal MarkupMultiplier,
    bool IsDefault) : ICommand<Result<CreatePricingPlanCommandResult>>;

public sealed record CreatePricingPlanCommandResult(Guid PricingPlanId);
