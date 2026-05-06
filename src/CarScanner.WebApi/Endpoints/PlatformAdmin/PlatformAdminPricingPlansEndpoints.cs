using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.CreatePricingPlan;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.DeletePricingPlan;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.RemoveModelPricing;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetDefaultPricingPlan;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.SetPricingPlanModules;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpdatePricingPlan;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Commands.UpsertModelPricing;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetAllPricingPlans;
using CarScanner.Application.Features.PlatformAdmin.PricingPlans.Queries.GetPricingPlanById;
using MediatR;

namespace CarScanner.WebApi.Endpoints.PlatformAdmin;

public static class PlatformAdminPricingPlansEndpoints
{
    private const string PlatformAdminRole = "PlatformAdmin";

    public static IEndpointRouteBuilder MapPlatformAdminPricingPlansEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/platform/pricing-plans")
            .WithTags("PlatformAdmin")
            .RequireAuthorization(policy => policy.RequireRole(PlatformAdminRole));

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create);
        group.MapPatch("/{id:guid}", Update);
        group.MapDelete("/{id:guid}", Delete);
        group.MapPatch("/{id:guid}/set-default", SetDefault);
        group.MapPatch("/{id:guid}/modules", SetModules);
        group.MapPost("/{id:guid}/model-pricings", UpsertModelPricing);
        group.MapDelete("/{id:guid}/model-pricings/{model}", RemoveModelPricing);

        return app;
    }

    private static async Task<IResult> GetAll(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAllPricingPlansQuery(), cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetPricingPlanByIdQuery(id), cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> Create(
        CreatePricingPlanRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreatePricingPlanCommand(
            request.Name,
            request.MarkupMultiplier,
            request.IsDefault);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/platform/pricing-plans/{success.PricingPlanId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdatePricingPlanRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdatePricingPlanCommand(
            id,
            request.Name,
            request.MarkupMultiplier);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> Delete(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeletePricingPlanCommand(id), cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SetDefault(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SetDefaultPricingPlanCommand(id), cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SetModules(
        Guid id,
        SetPricingPlanModulesRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetPricingPlanModulesCommand(id, request.Modules);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UpsertModelPricing(
        Guid id,
        UpsertModelPricingRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpsertModelPricingCommand(
            id,
            request.Model,
            request.PromptCostPerThousandTokens,
            request.CompletionCostPerThousandTokens,
            request.FixedSurchargePerCall);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> RemoveModelPricing(
        Guid id,
        string model,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new RemoveModelPricingCommand(id, model);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }
}

public sealed record CreatePricingPlanRequest(
    string Name,
    decimal MarkupMultiplier,
    bool IsDefault);

public sealed record UpdatePricingPlanRequest(
    string Name,
    decimal MarkupMultiplier);

public sealed record SetPricingPlanModulesRequest(IReadOnlyList<string> Modules);

public sealed record UpsertModelPricingRequest(
    string Model,
    decimal PromptCostPerThousandTokens,
    decimal CompletionCostPerThousandTokens,
    decimal? FixedSurchargePerCall);
