using CarScanner.Application.Abstraction.UserPrincipal;

namespace CarScanner.Infrastructure.Identity;

public sealed record UserPrincipal
(
	Guid UserId,
	Guid? TenantId,
	string Email,
	List<string> Roles
) : IUserPrincipal
{
	public static readonly UserPrincipal Anonymous = new
	(
		UserId: Guid.Empty,
		TenantId: null,
		Email: string.Empty,
		Roles: []
	);
}
