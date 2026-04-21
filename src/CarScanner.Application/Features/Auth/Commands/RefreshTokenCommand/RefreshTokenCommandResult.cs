namespace CarScanner.Application.Features.Auth.Commands.RefreshTokenCommand;

public sealed record RefreshTokenCommandResult
(
	string AccessToken,
	string RefreshToken
);
