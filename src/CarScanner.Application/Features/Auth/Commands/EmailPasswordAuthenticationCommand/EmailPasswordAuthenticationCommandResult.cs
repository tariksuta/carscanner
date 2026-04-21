namespace CarScanner.Application.Features.Auth.Commands.EmailPasswordAuthenticationCommand;

public sealed record EmailPasswordAuthenticationCommandResult
(
	string AccessToken,
	string RefreshToken
);