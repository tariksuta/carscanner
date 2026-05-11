using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.RemoveModelPricing;

public sealed class RemoveModelPricingCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<RemoveModelPricingCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result> Handle(
        RemoveModelPricingCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure(NotFound);

        plan.RemoveModelPricing(request.Model);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
