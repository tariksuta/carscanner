using CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;
using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Auth.Commands.RefreshTokenCommand;

public sealed class RefreshTokenCommandHandler : ICommandHandler<RefreshTokenCommand, Result<RefreshTokenCommandResult>>
{
	private readonly IApplicationUserRepository _userRepository;
	private readonly IAccessTokenGenerator _accessTokenGenerator;
	private readonly IRefreshTokenGenerator _refreshTokenGenerator;

	public RefreshTokenCommandHandler
	(
		IApplicationUserRepository userRepository,
		IAccessTokenGenerator accessTokenGenerator,
		IRefreshTokenGenerator refreshTokenGenerator
	)
	{
		ArgumentNullException.ThrowIfNull(userRepository);
		ArgumentNullException.ThrowIfNull(accessTokenGenerator);
		ArgumentNullException.ThrowIfNull(refreshTokenGenerator);

		_userRepository = userRepository;
		_accessTokenGenerator = accessTokenGenerator;
		_refreshTokenGenerator = refreshTokenGenerator;
	}

	public async Task<Result<RefreshTokenCommandResult>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
	{
		var parsedToken = await _refreshTokenGenerator.Parse(request.RefreshToken, cancellationToken);

		if (parsedToken is null)
		{
			return Result.Failure<RefreshTokenCommandResult>(ApplicationUserDomainErrors.TokenInvalid);
		}

		var user = await _userRepository.GetByIdAsync(parsedToken.UserPrincipal.UserId, cancellationToken);

		if (user is null)
		{
			return Result.Failure<RefreshTokenCommandResult>(ApplicationUserDomainErrors.TokenInvalid);
		}

		var newRefreshToken = await _refreshTokenGenerator.Generate(user, cancellationToken);

		var refreshResult = user.RefreshAuthentication(
			parsedToken.TokenId,
			newRefreshToken.TokenId,
			newRefreshToken.ExpiredOnUtc);

		if (refreshResult.IsFailure)
		{
			return Result.Failure<RefreshTokenCommandResult>(refreshResult.Error);
		}

		var accessToken = await _accessTokenGenerator.Generate(user, newRefreshToken, cancellationToken);

		if (accessToken.Result == AccessTokenResult.Failure)
		{
			return Result.Failure<RefreshTokenCommandResult>(ApplicationUserDomainErrors.TokenInvalid);
		}

		return new RefreshTokenCommandResult(accessToken.Token, newRefreshToken.Token);
	}
}
