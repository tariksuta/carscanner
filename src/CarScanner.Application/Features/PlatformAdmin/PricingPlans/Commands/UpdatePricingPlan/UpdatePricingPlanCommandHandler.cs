using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpdatePricingPlan;

public sealed class UpdatePricingPlanCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<UpdatePricingPlanCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result> Handle(
        UpdatePricingPlanCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure(NotFound);

        var renameResult = plan.Rename(request.Name);
        if (renameResult.IsFailure)
            return renameResult;

        var markupResult = plan.UpdateMarkup(request.MarkupMultiplier);
        if (markupResult.IsFailure)
            return markupResult;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
