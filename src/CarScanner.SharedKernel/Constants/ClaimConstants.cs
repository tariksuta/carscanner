namespace CarScanner.SharedKernel.Constants;

public static class ClaimConstants
{
	private const string ClaimTypeCarScanner2026Namespace = "https://schemas.carscanner.com/ws/2026/02/identity/claims";

	public const string Name = ClaimTypeCarScanner2026Namespace + "/name";

	public const string Role = ClaimTypeCarScanner2026Namespace + "/role";

	public const string NameIdentifier = ClaimTypeCarScanner2026Namespace + "/nameidentifier";

	public const string Email = ClaimTypeCarScanner2026Namespace + "/email";

	public const string RefreshTokenId = ClaimTypeCarScanner2026Namespace + "/refreshtokenidentifier";

	public const string AllowRefresh = ClaimTypeCarScanner2026Namespace + "/allowrefresh";

	public const string TokenType = ClaimTypeCarScanner2026Namespace + "/tokentype";

	// Short JWT claim names for access token payload (frontend-readable)
	public const string JwtSub = "sub";
	public const string JwtEmail = "email";
	public const string JwtRole = "role";
	public const string JwtFirstName = "first_name";
	public const string JwtLastName = "last_name";
	public const string JwtTenantId = "tenant_id";
}