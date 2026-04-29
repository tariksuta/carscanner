namespace CarScanner.SharedKernel.Authorization;

[Flags]
public enum PermissionAction
{
    None = 0,
    View = 1,
    Edit = 2,
    Delete = 4,
}
