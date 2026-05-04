using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.TopUpTenant;

public sealed class TopUpTenantCommandHandler(
    IBillingAccountRepository billingAccountRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<TopUpTenantCommand, Result<TopUpTenantCommandResult>>
{
    public async Task<Result<TopUpTenantCommandResult>> Handle(
        TopUpTenantCommand request,
        CancellationToken cancellationToken)
    {
        var account = await billingAccountRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (account is null)
            return Result.Failure<TopUpTenantCommandResult>(BillingDomainErrors.NotFoundForTenant(request.TenantId));

        var reference = string.IsNullOrWhiteSpace(request.Reference)
            ? "Manual top-up by PlatformAdmin"
            : request.Reference.Trim();

        var topUpResult = account.TopUp(request.Amount, reference);
        if (topUpResult.IsFailure)
            return Result.Failure<TopUpTenantCommandResult>(topUpResult.Error);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TopUpTenantCommandResult(account.Id, account.Balance);
    }
}
