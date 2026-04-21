using CarScanner.Application.Features.Rentals.Commands.ChangeRentalStatus;
using CarScanner.Application.Features.Rentals.Commands.CreateRental;
using CarScanner.Application.Features.Rentals.Queries.GetRentalById;
using CarScanner.Application.Features.Rentals.Queries.GetRentals;
using CarScanner.Domain.Enums;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Rentals;

public static class RentalEndpoints
{
    public static IEndpointRouteBuilder MapRentalEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/rentals")
            .WithTags("Rentals");

        group.MapGet("/", GetRentals);
        group.MapGet("/{id:guid}", GetRentalById);
        group.MapPost("/", CreateRental);
        group.MapPatch("/{id:guid}/status", ChangeRentalStatus);

        return app;
    }

    private static async Task<IResult> GetRentals(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetRentalsQuery(page, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetRentalById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetRentalByIdQuery(id);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> CreateRental(
        CreateRentalRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateRentalCommand(
            request.VehicleId,
            request.ClientId,
            request.ExpectedReturnDate,
            request.Notes);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/rentals/{success.RentalId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> ChangeRentalStatus(
        Guid id,
        ChangeRentalStatusRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new ChangeRentalStatusCommand(
            id,
            (RentalStatus)request.Status,
            request.EmployeeId,
            request.InspectionId,
            request.Mileage);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.Ok(),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateRentalRequest(
    Guid VehicleId,
    Guid ClientId,
    DateTime ExpectedReturnDate,
    string? Notes);

public sealed record ChangeRentalStatusRequest(
    int Status,
    Guid? EmployeeId,
    Guid? InspectionId,
    int? Mileage);
