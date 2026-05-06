using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetDefaultPricingPlan;

public sealed record SetDefaultPricingPlanCommand(Guid PricingPlanId) : ICommand<Result>;
