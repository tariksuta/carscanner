using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetPricingPlanModules;

public sealed record SetPricingPlanModulesCommand(
    Guid PricingPlanId,
    IReadOnlyList<string> ModuleNames) : ICommand<Result>;
