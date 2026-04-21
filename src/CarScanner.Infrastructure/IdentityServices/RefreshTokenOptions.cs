namespace CarScanner.Infrastructure.IdentityServices;

public sealed class RefreshTokenOptions
{
	public string SecurityKey { get; init; } = null!;

	public long TimeSpanSeconds { get; init; }

	public string Issuer { get; init; } = null!;

	public string Audience { get; init; } = null!;

	public string ProtectionKey { get; init; } = null!;
}
