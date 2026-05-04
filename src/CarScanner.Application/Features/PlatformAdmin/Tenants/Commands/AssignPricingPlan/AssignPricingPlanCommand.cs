using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.AssignPricingPlan;

public sealed record AssignPricingPlanCommand(
    Guid TenantId,
    Guid? PricingPlanId) : ICommand<Result>;
