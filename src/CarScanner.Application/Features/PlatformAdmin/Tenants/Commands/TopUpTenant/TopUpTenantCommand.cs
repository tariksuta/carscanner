using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.TopUpTenant;

public sealed record TopUpTenantCommand(
    Guid TenantId,
    decimal Amount,
    string? Reference) : ICommand<Result<TopUpTenantCommandResult>>;

public sealed record TopUpTenantCommandResult(
    Guid BillingAccountId,
    decimal NewBalance);
