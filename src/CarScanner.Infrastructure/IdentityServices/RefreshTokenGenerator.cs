using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Infrastructure.Identity;
using CarScanner.SharedKernel.Constants;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CarScanner.Infrastructure.IdentityServices;

public sealed class RefreshTokenGenerator : IRefreshTokenGenerator
{
	private const string BearerScheme = "Bearer";
	private const string RefreshTokenType = "RefreshToken";

	private readonly TimeProvider _timeProvider;
	private readonly RefreshTokenOptions _refreshTokenOptions;
	private readonly IDataProtector _dataProtector;

	public RefreshTokenGenerator
	(
		TimeProvider timeProvider,
		IOptions<RefreshTokenOptions> refreshTokenOptions,
		IDataProtectionProvider dataProtectionProvider
	)
	{
		ArgumentNullException.ThrowIfNull(timeProvider);
		ArgumentNullException.ThrowIfNull(refreshTokenOptions);
		ArgumentNullException.ThrowIfNull(dataProtectionProvider);

		_timeProvider = timeProvider;
		_refreshTokenOptions = refreshTokenOptions.Value;
		_dataProtector = dataProtectionProvider.CreateProtector(_refreshTokenOptions.ProtectionKey);
	}

	public ValueTask<RefreshToken> Generate(ApplicationUser user, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var jwtSecurityTokenHandler = new JwtSecurityTokenHandler
		{
			TokenLifetimeInMinutes = (int)TimeSpan.FromSeconds(_refreshTokenOptions.TimeSpanSeconds).TotalMinutes
		};

		var expiry = _timeProvider.GetUtcNow().UtcDateTime.AddSeconds(_refreshTokenOptions.TimeSpanSeconds);

		var tokenId = Guid.NewGuid().ToString("D");

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Jti, tokenId),
			new(ClaimConstants.NameIdentifier, user.Id.ToString()),
			new(ClaimConstants.Email, user.Email),
			new(ClaimConstants.TokenType, RefreshTokenType),
			new(JwtRegisteredClaimNames.Exp, new DateTimeOffset(expiry).ToUnixTimeMilliseconds().ToString())
		};

		var token = jwtSecurityTokenHandler.CreateJwtSecurityToken
		(
			issuer: _refreshTokenOptions.Issuer,
			audience: _refreshTokenOptions.Audience,
			expires: expiry,
			signingCredentials: new SigningCredentials(
				new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_refreshTokenOptions.SecurityKey)),
				SecurityAlgorithms.HmacSha512Signature),
			issuedAt: _timeProvider.GetUtcNow().UtcDateTime,
			subject: new ClaimsIdentity(claims, BearerScheme)
		);

		var jwtToken = jwtSecurityTokenHandler.WriteToken(token);

		var protectedToken = Convert.ToBase64String(_dataProtector.Protect(Encoding.UTF8.GetBytes(jwtToken)));

		IUserPrincipal userPrincipal = new UserPrincipal(user.Id, null, user.Email, []);

		return ValueTask.FromResult(new RefreshToken(tokenId, protectedToken, userPrincipal, expiry));
	}

	public ValueTask<RefreshToken?> Parse(string token, CancellationToken cancellationToken = default)
	{
		try
		{
			cancellationToken.ThrowIfCancellationRequested();

			var unProtectedToken = Encoding.UTF8.GetString(
				_dataProtector.Unprotect(Convert.FromBase64String(token)));

			var claimsPrincipal = new JwtSecurityTokenHandler()
				.ValidateToken(unProtectedToken, new TokenValidationParameters
				{
					ClockSkew = TimeSpan.Zero,
					ValidateAudience = true,
					ValidAudience = _refreshTokenOptions.Audience,
					ValidateIssuer = true,
					ValidIssuer = _refreshTokenOptions.Issuer,
					ValidateLifetime = true,
					ValidateTokenReplay = true,
					ValidateIssuerSigningKey = true,
					IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_refreshTokenOptions.SecurityKey)),
					RequireExpirationTime = true,
					RequireSignedTokens = true
				}, out SecurityToken validatedToken);

			var userId = Guid.Parse(claimsPrincipal.FindFirst(ClaimConstants.NameIdentifier)!.Value);
			var email = claimsPrincipal.FindFirst(ClaimConstants.Email)?.Value ?? string.Empty;

			IUserPrincipal userPrincipal = new UserPrincipal(userId, null, email, []);

			return ValueTask.FromResult<RefreshToken?>(
				new RefreshToken(
					claimsPrincipal.FindFirst(JwtRegisteredClaimNames.Jti)!.Value,
					unProtectedToken,
					userPrincipal,
					validatedToken.ValidTo));
		}
		catch
		{
			return ValueTask.FromResult<RefreshToken?>(null);
		}
	}
}
