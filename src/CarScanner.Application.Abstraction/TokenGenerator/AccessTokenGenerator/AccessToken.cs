namespace CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;

public sealed record AccessToken
(
	AccessTokenResult Result,
	string Token
);

public enum AccessTokenResult
{
	Success,
	Failure
}