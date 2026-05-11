using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenanceRemindersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MaintenanceReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DueMileage = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastNotificationSentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NotificationStage = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModifiedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceReminders", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceReminders_IsActive_DueDate",
                table: "MaintenanceReminders",
                columns: new[] { "IsActive", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceReminders_IsActive_DueMileage",
                table: "MaintenanceReminders",
                columns: new[] { "IsActive", "DueMileage" });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceReminders_TenantId",
                table: "MaintenanceReminders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceReminders_VehicleId_Type",
                table: "MaintenanceReminders",
                columns: new[] { "VehicleId", "Type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaintenanceReminders");
        }
    }
}
