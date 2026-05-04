using CarScanner.Domain.Aggregates.TenantAggregate.Errors;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ChangeTenantStatus;

public sealed class ChangeTenantStatusCommandHandler(
    ITenantRepository tenantRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<ChangeTenantStatusCommand, Result>
{
    private static readonly DomainError UnsupportedTransition =
        new("Tenant.UnsupportedTransition", "The requested status transition is not supported.");

    public async Task<Result> Handle(
        ChangeTenantStatusCommand request,
        CancellationToken cancellationToken)
    {
        var tenant = await tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant is null)
            return Result.Failure(TenantDomainErrors.NotFound(request.TenantId));

        var transition = request.TargetStatus switch
        {
            TenantStatus.Active => tenant.Reactivate(),
            TenantStatus.Suspended => tenant.Suspend(request.Reason ?? string.Empty),
            TenantStatus.Deactivated => tenant.Deactivate(),
            _ => Result.Failure(UnsupportedTransition),
        };

        if (transition.IsFailure)
            return transition;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
