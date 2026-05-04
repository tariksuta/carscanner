using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetLowBalanceThreshold;

public sealed record SetLowBalanceThresholdCommand(
    Guid TenantId,
    decimal? Threshold) : ICommand<Result>;
