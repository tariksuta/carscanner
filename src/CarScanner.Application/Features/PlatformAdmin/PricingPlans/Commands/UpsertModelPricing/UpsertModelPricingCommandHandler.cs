using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpsertModelPricing;

public sealed class UpsertModelPricingCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<UpsertModelPricingCommand, Result>
{
    private static readonly DomainError NotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result> Handle(
        UpsertModelPricingCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId, cancellationToken);
        if (plan is null)
            return Result.Failure(NotFound);

        var upsertResult = plan.UpsertModelPricing(
            request.Model,
            request.PromptCostPerThousandTokens,
            request.CompletionCostPerThousandTokens,
            request.FixedSurchargePerCall);

        if (upsertResult.IsFailure)
            return upsertResult;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
