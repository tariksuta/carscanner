using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetMonthlyCap;

public sealed record SetMonthlyCapCommand(
    Guid TenantId,
    decimal? Cap) : ICommand<Result>;
