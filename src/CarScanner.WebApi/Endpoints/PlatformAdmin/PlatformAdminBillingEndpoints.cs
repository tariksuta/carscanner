using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.AssignPricingPlan;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ChangeTenantStatus;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.ProvisionTenant;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetLowBalanceThreshold;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.SetMonthlyCap;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Commands.TopUpTenant;
using CarScanner.Application.Features.PlatformAdmin.Tenants.Queries.GetAllTenants;
using CarScanner.Domain.Enums;
using MediatR;

namespace CarScanner.WebApi.Endpoints.PlatformAdmin;

public static class PlatformAdminBillingEndpoints
{
    private const string PlatformAdminRole = "PlatformAdmin";

    public static IEndpointRouteBuilder MapPlatformAdminBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/platform/tenants")
            .WithTags("PlatformAdmin")
            .RequireAuthorization(policy => policy.RequireRole(PlatformAdminRole));

        group.MapGet("/", GetAllTenants);
        group.MapPost("/", ProvisionTenant);
        group.MapPost("/{tenantId:guid}/topup", TopUpTenant);
        group.MapPatch("/{tenantId:guid}/monthly-cap", SetMonthlyCap);
        group.MapPatch("/{tenantId:guid}/low-balance-threshold", SetLowBalanceThreshold);
        group.MapPatch("/{tenantId:guid}/pricing-plan", AssignPricingPlan);
        group.MapPost("/{tenantId:guid}/suspend", SuspendTenant);
        group.MapPost("/{tenantId:guid}/reactivate", ReactivateTenant);
        group.MapPost("/{tenantId:guid}/deactivate", DeactivateTenant);

        return app;
    }

    private static async Task<IResult> GetAllTenants(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAllTenantsQuery(), cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> ProvisionTenant(
        ProvisionTenantRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ProvisionTenantCommand(
            request.Name,
            request.ContactEmail,
            request.InitialBalance);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/platform/tenants/{success.TenantId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> TopUpTenant(
        Guid tenantId,
        TopUpTenantRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new TopUpTenantCommand(tenantId, request.Amount, request.Reference);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SetMonthlyCap(
        Guid tenantId,
        SetMonthlyCapRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetMonthlyCapCommand(tenantId, request.Cap);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SetLowBalanceThreshold(
        Guid tenantId,
        SetLowBalanceThresholdRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetLowBalanceThresholdCommand(tenantId, request.Threshold);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> AssignPricingPlan(
        Guid tenantId,
        AssignPricingPlanRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new AssignPricingPlanCommand(tenantId, request.PricingPlanId);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SuspendTenant(
        Guid tenantId,
        SuspendTenantRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ChangeTenantStatusCommand(tenantId, TenantStatus.Suspended, request.Reason);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> ReactivateTenant(
        Guid tenantId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ChangeTenantStatusCommand(tenantId, TenantStatus.Active, null);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> DeactivateTenant(
        Guid tenantId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ChangeTenantStatusCommand(tenantId, TenantStatus.Deactivated, null);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }
}

public sealed record ProvisionTenantRequest(
    string Name,
    string ContactEmail,
    decimal? InitialBalance);

public sealed record TopUpTenantRequest(
    decimal Amount,
    string? Reference);

public sealed record SetMonthlyCapRequest(decimal? Cap);

public sealed record SetLowBalanceThresholdRequest(decimal? Threshold);

public sealed record AssignPricingPlanRequest(Guid? PricingPlanId);

public sealed record SuspendTenantRequest(string? Reason);
