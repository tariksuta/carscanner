using CarScanner.Application.Features.Clients.Commands.CreateClient;
using CarScanner.Application.Features.Clients.Commands.UpdateClient;
using CarScanner.Application.Features.Clients.Queries.GetClientById;
using CarScanner.Application.Features.Clients.Queries.GetClients;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Clients;

public static class ClientEndpoints
{
    public static IEndpointRouteBuilder MapClientEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/clients")
            .WithTags("Clients");

        group.MapGet("/", GetClients);
        group.MapGet("/{clientId:guid}", GetClientById);
        group.MapPost("/", CreateClient);
        group.MapPut("/{clientId:guid}", UpdateClient);

        return app;
    }

    private static async Task<IResult> GetClients(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetClientsQuery(page, pageSize, search);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetClientById(
        Guid clientId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetClientByIdQuery(clientId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> CreateClient(
        CreateClientRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateClientCommand(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.DriverLicenseNumber,
            request.DriverLicenseExpiry,
            request.DriverLicenseCountry,
            request.Address,
            request.City,
            request.BirthDate,
            request.Jmbg,
            request.IsVip,
            request.MarketingConsent,
            request.InternalNote);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/clients/{success.ClientId}", success),
            error => Results.BadRequest(error));
    }
    private static async Task<IResult> UpdateClient(
        Guid clientId,
        UpdateClientRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateClientCommand(
            clientId,
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Address,
            request.DriverLicenseNumber,
            request.DriverLicenseExpiry,
            request.DriverLicenseCountry,
            request.City,
            request.BirthDate,
            request.Jmbg,
            request.IsVip,
            request.MarketingConsent,
            request.InternalNote);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateClientRequest(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string DriverLicenseNumber,
    DateTime DriverLicenseExpiry,
    string DriverLicenseCountry,
    string? Address,
    string? City,
    DateOnly? BirthDate,
    string? Jmbg,
    bool IsVip,
    bool MarketingConsent,
    string? InternalNote);

public sealed record UpdateClientRequest(
    string FirstName,
    string LastName,
    string Phone,
    string? Address,
    string DriverLicenseNumber,
    DateTime DriverLicenseExpiry,
    string DriverLicenseCountry,
    string? City,
    DateOnly? BirthDate,
    string? Jmbg,
    bool IsVip,
    bool MarketingConsent,
    string? InternalNote);
