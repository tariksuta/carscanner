using CarScanner.Application.Features.DamageReports.Commands.ProcessAnalysis;
using CarScanner.Application.Features.DamageReports.Queries.GetDamageReportById;
using CarScanner.Application.Features.DamageReports.Queries.GetDamageReports;
using MediatR;

namespace CarScanner.WebApi.Endpoints.DamageReports;

public static class DamageReportEndpoints
{
    public static IEndpointRouteBuilder MapDamageReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/damage-reports")
            .WithTags("Damage Reports");

        group.MapGet("/", GetDamageReports);
        group.MapGet("/{reportId:guid}", GetDamageReportById);
        group.MapPost("/{reportId:guid}/analyze", ProcessAnalysis);

        return app;
    }

    private static async Task<IResult> GetDamageReports(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetDamageReportsQuery(page, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetDamageReportById(
        Guid reportId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetDamageReportByIdQuery(reportId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> ProcessAnalysis(
        Guid reportId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ProcessDamageAnalysisCommand(reportId);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.Ok(new { Message = "Analysis completed" }),
            error => Results.BadRequest(error));
    }
}
