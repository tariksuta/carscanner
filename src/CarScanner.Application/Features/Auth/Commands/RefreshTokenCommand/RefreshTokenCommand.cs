using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Auth.Commands.RefreshTokenCommand;

public sealed record RefreshTokenCommand
(
	string RefreshToken
) : ICommand<Result<RefreshTokenCommandResult>>;
