using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.RemoveModelPricing;

public sealed record RemoveModelPricingCommand(
    Guid PricingPlanId,
    string Model) : ICommand<Result>;
