using CarScanner.Application.Features.Auth.Commands.EmailPasswordAuthenticationCommand;
using CarScanner.Application.Features.Auth.Commands.RefreshTokenCommand;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Auth;

public static class AuthEndpoints
{
	public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
	{
		var group = app.MapGroup("/api/auth")
			.WithTags("Auth");

		group.MapPost("/login", Login);
		group.MapPost("/refresh", Refresh).AllowAnonymous();

		return app;
	}

	private static async Task<IResult> Login(
		LoginRequest request,
		ISender sender,
		CancellationToken cancellationToken)
	{
		var command = new EmailPasswordAuthenticationCommand(
			request.Email,
			request.Password);

		var result = await sender.Send(command, cancellationToken);

		return result.Match(
			success => Results.Ok(success),
			error => Results.BadRequest(error));
	}

	private static async Task<IResult> Refresh(
		RefreshRequest request,
		ISender sender,
		CancellationToken cancellationToken)
	{
		var command = new RefreshTokenCommand(request.RefreshToken);

		var result = await sender.Send(command, cancellationToken);

		return result.Match(
			success => Results.Ok(success),
			error => Results.Unauthorized());
	}
}

public sealed record LoginRequest(
	string Email,
	string Password);

public sealed record RefreshRequest(
	string RefreshToken);
