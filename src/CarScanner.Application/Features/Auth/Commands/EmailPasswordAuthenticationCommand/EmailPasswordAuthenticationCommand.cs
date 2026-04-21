using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Auth.Commands.EmailPasswordAuthenticationCommand;

public sealed record EmailPasswordAuthenticationCommand
(
	string Email,
	string Password
) : ICommand<Result<EmailPasswordAuthenticationCommandResult>>;