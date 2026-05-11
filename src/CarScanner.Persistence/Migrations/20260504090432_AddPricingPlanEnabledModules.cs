using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingPlanEnabledModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Back-compat default: postojeci planovi dobijaju sve module osim PlatformTenants
            // (PlatformTenants je samo za platform admin tenant, ne za regularne tenante).
            const string DefaultModules = "Vehicles,Rentals,Inspections,DamageReports,Clients,Employees,Branches,SystemSettings,Billing,ServiceBook";

            migrationBuilder.AddColumn<string>(
                name: "EnabledModules",
                table: "PricingPlans",
                type: "nvarchar(500)",
                nullable: false,
                defaultValue: DefaultModules);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnabledModules",
                table: "PricingPlans");
        }
    }
}
