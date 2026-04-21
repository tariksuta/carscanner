namespace CarScanner.Application.Abstraction.UserPrincipal;

public interface IUserPrincipal
{
	public Guid UserId { get; }

	public Guid? TenantId { get;}

	public string Email { get; }

	public List<string> Roles { get; }
}