using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetMonthlyCap;

public sealed class SetMonthlyCapCommandHandler(
    IBillingAccountRepository billingAccountRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<SetMonthlyCapCommand, Result>
{
    public async Task<Result> Handle(
        SetMonthlyCapCommand request,
        CancellationToken cancellationToken)
    {
        var account = await billingAccountRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (account is null)
            return Result.Failure(BillingDomainErrors.NotFoundForTenant(request.TenantId));

        var setResult = account.SetMonthlyCap(request.Cap);
        if (setResult.IsFailure)
            return setResult;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
