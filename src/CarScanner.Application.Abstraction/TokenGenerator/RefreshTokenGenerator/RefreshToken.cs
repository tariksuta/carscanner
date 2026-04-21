using CarScanner.Application.Abstraction.UserPrincipal;

namespace CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;

public sealed record RefreshToken
(
	string TokenId,
	string Token,
	IUserPrincipal UserPrincipal,
	DateTime ExpiredOnUtc
);