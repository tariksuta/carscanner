using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.Authorization;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetPricingPlanModules;

public sealed class SetPricingPlanModulesCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<SetPricingPlanModulesCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    private static readonly DomainError InvalidModule =
        new("Billing.InvalidModule", "One or more module names are invalid.");

    public async Task<Result> Handle(
        SetPricingPlanModulesCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure(NotFound);

        var modules = new HashSet<Module>();
        foreach (var name in request.ModuleNames)
        {
            if (!Enum.TryParse<Module>(name, ignoreCase: true, out var module))
                return Result.Failure(InvalidModule);

            modules.Add(module);
        }

        plan.SetEnabledModules(modules);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
