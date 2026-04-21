using CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;
using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;
using Microsoft.AspNetCore.Identity;

namespace CarScanner.Application.Features.Auth.Commands.EmailPasswordAuthenticationCommand;

public sealed class EmailPasswordAuthenticationCommandHandler : ICommandHandler<EmailPasswordAuthenticationCommand, Result<EmailPasswordAuthenticationCommandResult>>
{
	private readonly IApplicationUserRepository _userRepository;
	private readonly IPasswordHasher<ApplicationUser> _passwordHasher;
	private readonly IAccessTokenGenerator _accessTokenGenerator;
	private readonly IRefreshTokenGenerator _refreshTokenGenerator;

	public EmailPasswordAuthenticationCommandHandler
	(
		IApplicationUserRepository userRepository,
		IPasswordHasher<ApplicationUser> passwordHasher,
		IAccessTokenGenerator accessTokenGenerator,
		IRefreshTokenGenerator refreshTokenGenerator
	)
	{
		ArgumentNullException.ThrowIfNull(userRepository);
		ArgumentNullException.ThrowIfNull(passwordHasher);
		ArgumentNullException.ThrowIfNull(accessTokenGenerator);
		ArgumentNullException.ThrowIfNull(refreshTokenGenerator);

		_userRepository = userRepository;
		_passwordHasher = passwordHasher;
		_accessTokenGenerator = accessTokenGenerator;
		_refreshTokenGenerator = refreshTokenGenerator;
	}

	public async Task<Result<EmailPasswordAuthenticationCommandResult>> Handle(EmailPasswordAuthenticationCommand request, CancellationToken cancellationToken)
	{
		var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

		if (user is null)
		{
			return Result.Failure<EmailPasswordAuthenticationCommandResult>(ApplicationUserDomainErrors.InvalidCredentials);
		}

		var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

		if (passwordResult == PasswordVerificationResult.Failed)
		{
			return Result.Failure<EmailPasswordAuthenticationCommandResult>(ApplicationUserDomainErrors.InvalidCredentials);
		}

		if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
		{
			user.UpdatePassword(_passwordHasher.HashPassword(user, request.Password));
		}

		var refreshToken = await _refreshTokenGenerator.Generate(user, cancellationToken);

		var accessToken = await _accessTokenGenerator.Generate(user, refreshToken, cancellationToken);

		if (accessToken.Result == AccessTokenResult.Failure)
		{
			return Result.Failure<EmailPasswordAuthenticationCommandResult>(ApplicationUserDomainErrors.InvalidCredentials);
		}

		var loginResult = user.Login(refreshToken.TokenId, refreshToken.ExpiredOnUtc);

		if (loginResult.IsFailure)
		{
			return Result.Failure<EmailPasswordAuthenticationCommandResult>(loginResult.Error);
		}

		return new EmailPasswordAuthenticationCommandResult(accessToken.Token, refreshToken.Token);
	}
}