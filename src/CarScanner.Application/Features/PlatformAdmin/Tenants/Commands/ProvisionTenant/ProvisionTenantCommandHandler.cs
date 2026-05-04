using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ProvisionTenant;

public sealed class ProvisionTenantCommandHandler(
    ITenantRepository tenantRepository,
    IBillingAccountRepository billingAccountRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<ProvisionTenantCommand, Result<ProvisionTenantCommandResult>>
{
    public async Task<Result<ProvisionTenantCommandResult>> Handle(
        ProvisionTenantCommand request,
        CancellationToken cancellationToken)
    {
        var tenantResult = Tenant.Provision(request.Name, request.ContactEmail);
        if (tenantResult.IsFailure)
            return Result.Failure<ProvisionTenantCommandResult>(tenantResult.Error);

        var tenant = tenantResult.Value;
        tenantRepository.Add(tenant);

        // Persist Tenant first so the FK from BillingAccounts.TenantId resolves on the
        // subsequent insert. EF doesn't know about the FK (added via raw SQL migration)
        // so it can't order the inserts itself.
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var account = BillingAccount.Provision(tenant.Id);

        if (request.InitialBalance is { } initial && initial > 0)
        {
            var topUpResult = account.TopUp(initial, "Initial provisioning");
            if (topUpResult.IsFailure)
                return Result.Failure<ProvisionTenantCommandResult>(topUpResult.Error);
        }

        billingAccountRepository.Add(account);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProvisionTenantCommandResult(tenant.Id, account.Id);
    }
}
