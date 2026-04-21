using CarScanner.Application.Features.Vehicles.Commands.CreateVehicle;
using CarScanner.Application.Features.Vehicles.Commands.DeleteVehicleImage;
using CarScanner.Application.Features.Vehicles.Commands.SetPrimaryVehicleImage;
using CarScanner.Application.Features.Vehicles.Commands.UpdateVehicle;
using CarScanner.Application.Features.Vehicles.Commands.UploadVehicleImage;
using CarScanner.Application.Features.Vehicles.Queries.GetVehicleById;
using CarScanner.Application.Features.Vehicles.Queries.GetVehicles;
using CarScanner.Domain.Enums;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Vehicles;

public static class VehicleEndpoints
{
    public static IEndpointRouteBuilder MapVehicleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/vehicles")
            .WithTags("Vehicles");

        group.MapGet("/", GetVehicles);
        group.MapPost("/", CreateVehicle);
        group.MapGet("/{vehicleId:guid}", GetVehicleById);
        group.MapPut("/{vehicleId:guid}", UpdateVehicle);
        group.MapPost("/{vehicleId:guid}/images", UploadVehicleImage).DisableAntiforgery();
        group.MapDelete("/{vehicleId:guid}/images/{imageId:guid}", DeleteVehicleImage);
        group.MapPut("/{vehicleId:guid}/images/{imageId:guid}/primary", SetPrimaryImage);

        return app;
    }

    private static async Task<IResult> GetVehicles(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        bool onlyAvailable = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetVehiclesQuery(page, pageSize, search, onlyAvailable);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> CreateVehicle(
        CreateVehicleRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateVehicleCommand(
            request.Brand,
            request.Model,
            request.Year,
            request.LicensePlate,
            request.Vin,
            request.Color,
            request.CurrentMileage,
            request.Fuel,
            request.Gear,
            request.PowerKw,
            request.Seats,
            request.RegistrationExpiry,
            request.InsuranceExpiry);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/vehicles/{success.VehicleId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetVehicleById(
        Guid vehicleId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetVehicleByIdQuery(vehicleId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> UpdateVehicle(
        Guid vehicleId,
        UpdateVehicleRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateVehicleCommand(
            vehicleId,
            request.Brand,
            request.Model,
            request.Year,
            request.LicensePlate,
            request.Color,
            request.CurrentMileage,
            request.Fuel,
            request.Gear,
            request.PowerKw,
            request.Seats,
            request.RegistrationExpiry,
            request.InsuranceExpiry,
            request.Status);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UploadVehicleImage(
        Guid vehicleId,
        IFormFile image,
        bool isPrimary,
        ISender sender,
        CancellationToken cancellationToken)
    {
        using var stream = image.OpenReadStream();

        var command = new UploadVehicleImageCommand(
            vehicleId,
            stream,
            image.FileName,
            image.ContentType,
            isPrimary);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> DeleteVehicleImage(
        Guid vehicleId,
        Guid imageId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new DeleteVehicleImageCommand(vehicleId, imageId);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> SetPrimaryImage(
        Guid vehicleId,
        Guid imageId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new SetPrimaryVehicleImageCommand(vehicleId, imageId);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateVehicleRequest(
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Vin,
    string Color,
    int CurrentMileage,
    FuelType Fuel,
    GearType Gear,
    int? PowerKw,
    int Seats,
    DateOnly? RegistrationExpiry,
    DateOnly? InsuranceExpiry);

public sealed record UpdateVehicleRequest(
    string Brand,
    string Model,
    int Year,
    string LicensePlate,
    string Color,
    int CurrentMileage,
    FuelType Fuel,
    GearType Gear,
    int? PowerKw,
    int Seats,
    DateOnly? RegistrationExpiry,
    DateOnly? InsuranceExpiry,
    VehicleStatus Status);
