using CarScanner.SharedKernel.Authorization;

namespace CarScanner.Application.Authorization;

public static class RolePermissionMatrix
{
    private const PermissionAction All = PermissionAction.View | PermissionAction.Edit | PermissionAction.Delete;
    private const PermissionAction ViewEdit = PermissionAction.View | PermissionAction.Edit;
    private const PermissionAction View = PermissionAction.View;
    private const PermissionAction None = PermissionAction.None;

    private static readonly IReadOnlyDictionary<string, IReadOnlyDictionary<Module, PermissionAction>> Matrix =
        new Dictionary<string, IReadOnlyDictionary<Module, PermissionAction>>(StringComparer.OrdinalIgnoreCase)
        {
            ["Admin"] = new Dictionary<Module, PermissionAction>
            {
                [Module.Vehicles] = All,
                [Module.Rentals] = All,
                [Module.Inspections] = All,
                [Module.DamageReports] = All,
                [Module.Clients] = All,
                [Module.Employees] = All,
                [Module.Branches] = All,
                [Module.SystemSettings] = All,
            },
            ["Manager"] = new Dictionary<Module, PermissionAction>
            {
                [Module.Vehicles] = ViewEdit,
                [Module.Rentals] = ViewEdit,
                [Module.Inspections] = All,
                [Module.DamageReports] = All,
                [Module.Clients] = ViewEdit,
                [Module.Employees] = ViewEdit,
                [Module.Branches] = ViewEdit,
                [Module.SystemSettings] = View,
            },
            ["Inspektor"] = new Dictionary<Module, PermissionAction>
            {
                [Module.Vehicles] = ViewEdit,
                [Module.Rentals] = ViewEdit,
                [Module.Inspections] = All,
                [Module.DamageReports] = ViewEdit,
                [Module.Clients] = View,
                [Module.Employees] = None,
                [Module.Branches] = None,
                [Module.SystemSettings] = None,
            },
            ["Recepcija"] = new Dictionary<Module, PermissionAction>
            {
                [Module.Vehicles] = ViewEdit,
                [Module.Rentals] = ViewEdit,
                [Module.Inspections] = View,
                [Module.DamageReports] = View,
                [Module.Clients] = ViewEdit,
                [Module.Employees] = None,
                [Module.Branches] = View,
                [Module.SystemSettings] = None,
            },
        };

    public static IReadOnlyDictionary<Module, PermissionAction> ForRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role) || !Matrix.TryGetValue(role, out var permissions))
            return EmptyMatrix();

        return permissions;
    }

    public static IReadOnlyList<Module> AllModules { get; } =
        Enum.GetValues<Module>();

    private static IReadOnlyDictionary<Module, PermissionAction> EmptyMatrix() =>
        AllModules.ToDictionary(m => m, _ => PermissionAction.None);
}
