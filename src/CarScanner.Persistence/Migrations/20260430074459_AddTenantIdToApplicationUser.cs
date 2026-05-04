using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ApplicationUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUsers_TenantId",
                table: "ApplicationUsers",
                column: "TenantId");

            // Backfill: every existing ApplicationUser that's linked to an Employee
            // inherits the Employee's TenantId. Users without an Employee row remain
            // null and become PlatformAdmin candidates (no tenant scope).
            migrationBuilder.Sql(@"
UPDATE u
SET u.TenantId = e.TenantId
FROM ApplicationUsers u
INNER JOIN Employees e ON e.ApplicationUserId = u.Id
WHERE u.TenantId IS NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ApplicationUsers_TenantId",
                table: "ApplicationUsers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ApplicationUsers");
        }
    }
}
