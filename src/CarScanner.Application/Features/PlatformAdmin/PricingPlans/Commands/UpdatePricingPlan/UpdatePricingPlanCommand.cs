using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpdatePricingPlan;

public sealed record UpdatePricingPlanCommand(
    Guid PricingPlanId,
    string Name,
    decimal MarkupMultiplier) : ICommand<Result>;
