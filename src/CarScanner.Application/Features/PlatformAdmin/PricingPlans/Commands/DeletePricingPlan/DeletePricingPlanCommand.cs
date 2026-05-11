using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.DeletePricingPlan;

public sealed record DeletePricingPlanCommand(Guid PricingPlanId) : ICommand<Result>;
