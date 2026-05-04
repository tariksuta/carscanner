using CarScanner.Application.Features.Billing.Queries.GetMyBillingAccount;
using CarScanner.Application.Features.Billing.Queries.GetMyUsage;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Billing;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/billing")
            .WithTags("Billing")
            .RequireAuthorization();

        group.MapGet("/account", GetMyAccount);
        group.MapGet("/usage", GetMyUsage);

        return app;
    }

    private static async Task<IResult> GetMyAccount(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetMyBillingAccountQuery(), cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> GetMyUsage(
        ISender sender,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetMyUsageQuery(from, to, page, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }
}
