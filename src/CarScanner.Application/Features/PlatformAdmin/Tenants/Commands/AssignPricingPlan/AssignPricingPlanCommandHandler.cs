using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.AssignPricingPlan;

public sealed class AssignPricingPlanCommandHandler(
    IBillingAccountRepository billingAccountRepository,
    IPricingPlanRepository pricingPlanRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<AssignPricingPlanCommand, Result>
{
    private static readonly DomainError PlanNotFound =
        new("Billing.PlanNotFound", "Pricing plan was not found.");

    public async Task<Result> Handle(
        AssignPricingPlanCommand request,
        CancellationToken cancellationToken)
    {
        var account = await billingAccountRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (account is null)
            return Result.Failure(BillingDomainErrors.NotFoundForTenant(request.TenantId));

        if (request.PricingPlanId.HasValue)
        {
            var plan = await pricingPlanRepository.GetByIdAsync(request.PricingPlanId.Value, cancellationToken);
            if (plan is null)
                return Result.Failure(PlanNotFound);
        }

        account.AssignPricingPlan(request.PricingPlanId);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
