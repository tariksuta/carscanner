using CarScanner.Application.Features.Branches.Commands.CreateBranch;
using CarScanner.Application.Features.Branches.Commands.SetBranchActiveStatus;
using CarScanner.Application.Features.Branches.Commands.UpdateBranch;
using CarScanner.Application.Features.Branches.Queries.GetBranchById;
using CarScanner.Application.Features.Branches.Queries.GetBranches;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Branches;

public static class BranchEndpoints
{
    public static IEndpointRouteBuilder MapBranchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/branches")
            .WithTags("Branches");

        group.MapGet("/", GetBranches);
        group.MapGet("/{branchId:guid}", GetBranchById);
        group.MapPost("/", CreateBranch);
        group.MapPut("/{branchId:guid}", UpdateBranch);
        group.MapPost("/{branchId:guid}/activate", ActivateBranch);
        group.MapPost("/{branchId:guid}/deactivate", DeactivateBranch);

        return app;
    }

    private static async Task<IResult> GetBranches(
        ISender sender,
        bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetBranchesQuery(activeOnly);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetBranchById(
        Guid branchId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetBranchByIdQuery(branchId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> CreateBranch(
        CreateBranchRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateBranchCommand(request.Name, request.City, request.Address);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/branches/{success.BranchId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UpdateBranch(
        Guid branchId,
        UpdateBranchRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateBranchCommand(branchId, request.Name, request.City, request.Address);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> ActivateBranch(
        Guid branchId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetBranchActiveStatusCommand(branchId, IsActive: true);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> DeactivateBranch(
        Guid branchId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetBranchActiveStatusCommand(branchId, IsActive: false);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateBranchRequest(string Name, string City, string? Address);

public sealed record UpdateBranchRequest(string Name, string City, string? Address);
