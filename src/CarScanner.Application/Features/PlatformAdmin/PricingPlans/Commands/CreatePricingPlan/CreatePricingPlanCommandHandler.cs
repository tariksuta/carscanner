using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.CreatePricingPlan;

public sealed class CreatePricingPlanCommandHandler(
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<CreatePricingPlanCommand, Result<CreatePricingPlanCommandResult>>
{
    public async Task<Result<CreatePricingPlanCommandResult>> Handle(
        CreatePricingPlanCommand request,
        CancellationToken cancellationToken)
    {
        var planResult = PricingPlan.Create(request.Name, request.MarkupMultiplier, request.IsDefault);
        if (planResult.IsFailure)
            return Result.Failure<CreatePricingPlanCommandResult>(planResult.Error);

        var plan = planResult.Value;

        if (request.IsDefault)
        {
            // Atomic single-default invariant: clear any currently-default plan in the same SaveChanges.
            var currentDefault = await pricingPlanRepository.GetDefaultAsync(cancellationToken);
            currentDefault?.ClearDefault();
        }

        pricingPlanRepository.Add(plan);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreatePricingPlanCommandResult(plan.Id);
    }
}
