using System.Security.Claims;
using CarScanner.Application.Features.Profile.Commands.ChangePassword;
using CarScanner.Application.Features.Profile.Commands.DeleteProfileImage;
using CarScanner.Application.Features.Profile.Commands.UpdateProfile;
using CarScanner.Application.Features.Profile.Commands.UploadProfileImage;
using CarScanner.Application.Features.Profile.Queries.GetProfile;
using CarScanner.SharedKernel.Constants;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Profile;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/profile")
            .WithTags("Profile")
            .RequireAuthorization();

        group.MapGet("/", GetProfile);
        group.MapPut("/", UpdateProfile);
        group.MapPut("/password", ChangePassword);
        group.MapPost("/image", UploadProfileImage).DisableAntiforgery();
        group.MapDelete("/image", DeleteProfileImage);

        return app;
    }

    private static async Task<IResult> GetProfile(
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        if (userId is null)
            return Results.Unauthorized();

        var query = new GetProfileQuery(userId.Value);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UpdateProfile(
        UpdateProfileRequest request,
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        if (userId is null)
            return Results.Unauthorized();

        var command = new UpdateProfileCommand(
            userId.Value,
            request.FirstName,
            request.LastName,
            request.Street,
            request.City,
            request.ZipCode,
            request.Country);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> ChangePassword(
        ChangePasswordRequest request,
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        if (userId is null)
            return Results.Unauthorized();

        var command = new ChangePasswordCommand(
            userId.Value,
            request.CurrentPassword,
            request.NewPassword);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UploadProfileImage(
        IFormFile image,
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        if (userId is null)
            return Results.Unauthorized();

        using var stream = image.OpenReadStream();

        var command = new UploadProfileImageCommand(
            userId.Value,
            stream,
            image.FileName,
            image.ContentType);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> DeleteProfileImage(
        ClaimsPrincipal user,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        if (userId is null)
            return Results.Unauthorized();

        var command = new DeleteProfileImageCommand(userId.Value);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirst(ClaimConstants.JwtSub)?.Value;
        return Guid.TryParse(sub, out var userId) ? userId : null;
    }
}

public sealed record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? Street,
    string? City,
    string? ZipCode,
    string? Country);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);
