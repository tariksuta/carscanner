using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.DeletePricingPlan;

public sealed class DeletePricingPlanCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IBillingAccountRepository billingAccountRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<DeletePricingPlanCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    private static readonly DomainError InUse =
        new("Billing.PlanInUse", "Pricing plan is currently assigned to one or more tenants.");

    public async Task<Result> Handle(
        DeletePricingPlanCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure(NotFound);

        var inUse = await billingAccountRepository.AnyWithPricingPlanAsync(
            request.PricingPlanId,
            cancellationToken);
        if (inUse)
            return Result.Failure(InUse);

        pricingPlanRepository.Remove(plan);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
