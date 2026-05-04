using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantsAndBillingAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    LifetimeToppedUp = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    LifetimeSpent = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    MonthlyHardCap = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    MonthSpent = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    MonthAnchorUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LowBalanceThreshold = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    LowBalanceAlertSentForCurrentDip = table.Column<bool>(type: "bit", nullable: false),
                    CurrentPricingPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_BillingAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProvisionedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SuspensionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BillingReservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BillingAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualCost = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingReservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingReservations_BillingAccounts_BillingAccountId",
                        column: x => x.BillingAccountId,
                        principalTable: "BillingAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingAccounts_TenantId",
                table: "BillingAccounts",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BillingReservations_BillingAccountId",
                table: "BillingReservations",
                column: "BillingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingReservations_CreatedAtUtc",
                table: "BillingReservations",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_BillingReservations_Status",
                table: "BillingReservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_ContactEmail",
                table: "Tenants",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Status",
                table: "Tenants",
                column: "Status");

            // Backfill: provision a Tenant row for every distinct TenantId already
            // present in tenant-scoped tables, then a zero-balance BillingAccount per Tenant.
            migrationBuilder.Sql(@"
INSERT INTO Tenants (Id, Name, ContactEmail, Status, ProvisionedAt, CreatedBy, CreatedOnUtc, IsDeleted)
SELECT DISTINCT
    t.TenantId,
    'Tenant ' + CAST(t.TenantId AS NVARCHAR(36)),
    'noreply@example.com',
    0,
    SYSUTCDATETIME(),
    '00000000-0000-0000-0000-000000000000',
    SYSUTCDATETIME(),
    0
FROM (
    SELECT TenantId FROM Vehicles
    UNION
    SELECT TenantId FROM Clients
    UNION
    SELECT TenantId FROM Employees
    UNION
    SELECT TenantId FROM Branches
    UNION
    SELECT TenantId FROM Rentals
) t
WHERE t.TenantId IS NOT NULL
  AND t.TenantId <> '00000000-0000-0000-0000-000000000000'
  AND NOT EXISTS (SELECT 1 FROM Tenants WHERE Id = t.TenantId);

INSERT INTO BillingAccounts (Id, TenantId, Currency, Balance, LifetimeToppedUp, LifetimeSpent, MonthSpent, MonthAnchorUtc, LowBalanceAlertSentForCurrentDip, CreatedBy, CreatedOnUtc, IsDeleted)
SELECT
    NEWID(),
    t.Id,
    'USD',
    0,
    0,
    0,
    0,
    DATEADD(day, 1 - DAY(SYSUTCDATETIME()), CAST(CAST(SYSUTCDATETIME() AS date) AS datetime2)),
    0,
    '00000000-0000-0000-0000-000000000000',
    SYSUTCDATETIME(),
    0
FROM Tenants t
WHERE NOT EXISTS (SELECT 1 FROM BillingAccounts WHERE TenantId = t.Id);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillingReservations");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "BillingAccounts");
        }
    }
}
