using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetDefaultPricingPlan;

public sealed class SetDefaultPricingPlanCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<SetDefaultPricingPlanCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result> Handle(
        SetDefaultPricingPlanCommand request,
        CancellationToken cancellationToken)
    {
        // Load all plans so we can clear default on any currently-default plan, even if more
        // than one exists due to manual SQL/seed drift, in a single SaveChanges.
        var allPlans = await pricingPlanRepository.GetAllAsync(cancellationToken);

        var target = allPlans.FirstOrDefault(p => p.Id == request.PricingPlanId);
        if (target is null)
            return Result.Failure(NotFound);

        foreach (var plan in allPlans)
        {
            if (plan.Id != target.Id && plan.IsDefault)
                plan.ClearDefault();
        }

        target.MarkAsDefault();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
