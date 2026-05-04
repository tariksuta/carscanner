using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ChangeTenantStatus;

public sealed record ChangeTenantStatusCommand(
    Guid TenantId,
    TenantStatus TargetStatus,
    string? Reason) : ICommand<Result>;
