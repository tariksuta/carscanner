using CarScanner.Application.Features.Inspections.Commands.CompleteInspection;
using CarScanner.Application.Features.Inspections.Commands.CreateInspection;
using CarScanner.Application.Features.Inspections.Commands.EnsureRentalInspection;
using CarScanner.Application.Features.Inspections.Commands.UploadPhoto;
using CarScanner.Application.Features.Inspections.Queries.GetInspectionById;
using CarScanner.Application.Features.Inspections.Queries.GetInspectionByRental;
using CarScanner.Application.Features.Inspections.Queries.GetInspections;
using CarScanner.Domain.Enums;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Inspections;

public static class InspectionEndpoints
{
    public static IEndpointRouteBuilder MapInspectionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inspections")
            .WithTags("Inspections");

        group.MapGet("/", GetInspections);
        group.MapGet("/{inspectionId:guid}", GetInspectionById);
        group.MapGet("/by-rental/{rentalId:guid}", GetInspectionByRental);
        group.MapPost("/", CreateInspection);
        group.MapPost("/ensure", EnsureRentalInspection);
        group.MapPost("/{inspectionId:guid}/photos", UploadPhoto).DisableAntiforgery();
        group.MapPost("/{inspectionId:guid}/complete", CompleteInspection);

        return app;
    }

    private static async Task<IResult> GetInspections(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetInspectionsQuery(page, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetInspectionById(
        Guid inspectionId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetInspectionByIdQuery(inspectionId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> GetInspectionByRental(
        Guid rentalId,
        InspectionType type,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetInspectionByRentalQuery(rentalId, type);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> CreateInspection(
        CreateInspectionRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateInspectionCommand(
            request.RentalId,
            request.EmployeeId,
            request.InspectionType);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/inspections/{success.InspectionId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> EnsureRentalInspection(
        EnsureRentalInspectionRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new EnsureRentalInspectionCommand(
            request.RentalId,
            request.EmployeeId,
            request.InspectionType);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UploadPhoto(
        Guid inspectionId,
        IFormFile photo,
        PhotoPosition position,
        ISender sender,
        CancellationToken cancellationToken)
    {
        using var stream = photo.OpenReadStream();

        var command = new UploadPhotoCommand(
            inspectionId,
            position,
            stream,
            photo.FileName,
            photo.ContentType);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> CompleteInspection(
        Guid inspectionId,
        CompleteInspectionRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CompleteInspectionCommand(inspectionId, request.CurrentMileage);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateInspectionRequest(
    Guid RentalId,
    Guid EmployeeId,
    InspectionType InspectionType);

public sealed record EnsureRentalInspectionRequest(
    Guid RentalId,
    Guid EmployeeId,
    InspectionType InspectionType);

public sealed record CompleteInspectionRequest(int CurrentMileage);
