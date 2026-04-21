namespace CarScanner.Infrastructure.IdentityServices;

public class AccessTokenOptions
{
	public string SecurityKey { get; init; }

	public long TimeSpanSeconds { get; init; }

	public string Issuer { get; init; }

	public string Audience { get; init; }

	public bool AllowRefresh { get; init; }
}