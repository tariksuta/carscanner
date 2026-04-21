using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using System.Security.Claims;

namespace CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;

public interface IAccessTokenGenerator
{
	ValueTask<AccessToken> Generate(ApplicationUser user, RefreshToken refreshToken,
		CancellationToken cancellationToken);

	ValueTask<AccessToken> Generate(ApplicationUser user, RefreshToken refreshToken,
		IList<Claim> additionalClaims, CancellationToken cancellationToken);

	ValueTask<IUserPrincipal> Parse(string token, CancellationToken cancellationToken = default);
}
