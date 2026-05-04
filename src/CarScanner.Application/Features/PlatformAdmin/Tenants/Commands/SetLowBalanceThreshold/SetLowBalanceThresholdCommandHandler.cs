using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetLowBalanceThreshold;

public sealed class SetLowBalanceThresholdCommandHandler(
    IBillingAccountRepository billingAccountRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<SetLowBalanceThresholdCommand, Result>
{
    public async Task<Result> Handle(
        SetLowBalanceThresholdCommand request,
        CancellationToken cancellationToken)
    {
        var account = await billingAccountRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (account is null)
            return Result.Failure(BillingDomainErrors.NotFoundForTenant(request.TenantId));

        var setResult = account.SetLowBalanceThreshold(request.Threshold);
        if (setResult.IsFailure)
            return setResult;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
