using CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;
using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Infrastructure.Identity;
using CarScanner.SharedKernel.Constants;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CarScanner.Infrastructure.IdentityServices;

public sealed class AccessTokenGenerator : IAccessTokenGenerator
{
	private const string BearerScheme = "Bearer";

	private readonly TimeProvider _timeProvider;
	private readonly AccessTokenOptions _accessTokenOptions;

	public AccessTokenGenerator
	(
		TimeProvider timeProvider,
		IOptions<AccessTokenOptions> accessTokenOptions
	)
	{
		ArgumentNullException.ThrowIfNull(timeProvider);
		ArgumentNullException.ThrowIfNull(accessTokenOptions);

		_timeProvider = timeProvider;
		_accessTokenOptions = accessTokenOptions.Value;
	}

	public ValueTask<AccessToken> Generate(ApplicationUser user, RefreshToken refreshToken, CancellationToken cancellationToken)
	{
		return GenerateToken(user, refreshToken, [], cancellationToken);
	}

	public ValueTask<AccessToken> Generate(ApplicationUser user, RefreshToken refreshToken, IList<Claim> additionalClaims, CancellationToken cancellationToken)
	{
		return GenerateToken(user, refreshToken, additionalClaims, cancellationToken);
	}

	public ValueTask<IUserPrincipal> Parse(string token, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var jwtSecurityTokenHandler = new JwtSecurityTokenHandler
		{
			MapInboundClaims = false
		};

		var claimsPrincipal = jwtSecurityTokenHandler.ValidateToken(token, new TokenValidationParameters
		{
			ValidateAudience = true,
			ValidAudience = _accessTokenOptions.Audience,
			ValidateIssuer = true,
			ValidIssuer = _accessTokenOptions.Issuer,
			ValidateLifetime = false,
			ValidateTokenReplay = true,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_accessTokenOptions.SecurityKey)),
			RequireExpirationTime = true,
			RequireSignedTokens = true,
			ClockSkew = TimeSpan.FromSeconds(5),
			RoleClaimType = ClaimConstants.JwtRole,
			NameClaimType = ClaimConstants.JwtEmail
		}, out _);

		var userId = Guid.Parse(claimsPrincipal.FindFirst(ClaimConstants.JwtSub)!.Value);
		var email = claimsPrincipal.FindFirst(ClaimConstants.JwtEmail)?.Value ?? string.Empty;
		var roles = claimsPrincipal.FindAll(ClaimConstants.JwtRole).Select(c => c.Value).ToList();

		IUserPrincipal userPrincipal = new UserPrincipal(userId, null, email, roles);

		return ValueTask.FromResult(userPrincipal);
	}

	private ValueTask<AccessToken> GenerateToken(ApplicationUser user, RefreshToken refreshToken, IList<Claim> additionalClaims, CancellationToken cancellationToken)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var claims = new List<Claim>
		{
			new(ClaimConstants.JwtSub, user.Id.ToString()),
			new(ClaimConstants.JwtEmail, user.Email),
			new(ClaimConstants.RefreshTokenId, refreshToken.TokenId)
		};

		if (!string.IsNullOrWhiteSpace(user.FirstName))
			claims.Add(new Claim(ClaimConstants.JwtFirstName, user.FirstName));

		if (!string.IsNullOrWhiteSpace(user.LastName))
			claims.Add(new Claim(ClaimConstants.JwtLastName, user.LastName));

		if (!string.IsNullOrWhiteSpace(user.Role))
			claims.Add(new Claim(ClaimConstants.JwtRole, user.Role));

		if (additionalClaims is { Count: > 0 })
		{
			claims.AddRange(additionalClaims);
		}

		var expiry = _timeProvider.GetUtcNow().UtcDateTime.AddSeconds(_accessTokenOptions.TimeSpanSeconds);

		var initialClaims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
			new(ClaimConstants.AllowRefresh, _accessTokenOptions.AllowRefresh.ToString()),
			new(JwtRegisteredClaimNames.Exp, new DateTimeOffset(expiry).ToUnixTimeMilliseconds().ToString())
		};

		initialClaims.AddRange(claims);

		var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();

		var signingCredentials = new SigningCredentials(
			new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_accessTokenOptions.SecurityKey)),
			SecurityAlgorithms.HmacSha512Signature);

		var token = jwtSecurityTokenHandler.CreateJwtSecurityToken
		(
			issuer: _accessTokenOptions.Issuer,
			audience: _accessTokenOptions.Audience,
			expires: expiry,
			signingCredentials: signingCredentials,
			issuedAt: _timeProvider.GetUtcNow().UtcDateTime,
			subject: new ClaimsIdentity(initialClaims, BearerScheme)
		);

		return ValueTask.FromResult(new AccessToken(AccessTokenResult.Success, jwtSecurityTokenHandler.WriteToken(token)));
	}
}
