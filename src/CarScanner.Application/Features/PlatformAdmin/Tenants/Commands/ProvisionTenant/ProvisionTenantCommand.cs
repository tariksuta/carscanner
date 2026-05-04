using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ProvisionTenant;

public sealed record ProvisionTenantCommand(
    string Name,
    string ContactEmail,
    decimal? InitialBalance) : ICommand<Result<ProvisionTenantCommandResult>>;

public sealed record ProvisionTenantCommandResult(
    Guid TenantId,
    Guid BillingAccountId);
