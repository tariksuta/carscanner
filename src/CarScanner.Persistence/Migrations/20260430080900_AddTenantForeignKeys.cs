using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // FK constraints on all tenant-scoped tables. ON DELETE NO ACTION (RESTRICT)
            // — deleting a Tenant requires explicitly clearing its data first; no cascades.
            migrationBuilder.Sql(@"
ALTER TABLE ApplicationUsers
    ADD CONSTRAINT FK_ApplicationUsers_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE Vehicles
    ADD CONSTRAINT FK_Vehicles_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE Clients
    ADD CONSTRAINT FK_Clients_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE Employees
    ADD CONSTRAINT FK_Employees_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE Branches
    ADD CONSTRAINT FK_Branches_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE Rentals
    ADD CONSTRAINT FK_Rentals_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE VehicleInspections
    ADD CONSTRAINT FK_VehicleInspections_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE DamageReports
    ADD CONSTRAINT FK_DamageReports_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE BillingAccounts
    ADD CONSTRAINT FK_BillingAccounts_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;

ALTER TABLE AiUsageRecords
    ADD CONSTRAINT FK_AiUsageRecords_Tenants_TenantId
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id) ON DELETE NO ACTION;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE AiUsageRecords DROP CONSTRAINT FK_AiUsageRecords_Tenants_TenantId;
ALTER TABLE BillingAccounts DROP CONSTRAINT FK_BillingAccounts_Tenants_TenantId;
ALTER TABLE DamageReports DROP CONSTRAINT FK_DamageReports_Tenants_TenantId;
ALTER TABLE VehicleInspections DROP CONSTRAINT FK_VehicleInspections_Tenants_TenantId;
ALTER TABLE Rentals DROP CONSTRAINT FK_Rentals_Tenants_TenantId;
ALTER TABLE Branches DROP CONSTRAINT FK_Branches_Tenants_TenantId;
ALTER TABLE Employees DROP CONSTRAINT FK_Employees_Tenants_TenantId;
ALTER TABLE Clients DROP CONSTRAINT FK_Clients_Tenants_TenantId;
ALTER TABLE Vehicles DROP CONSTRAINT FK_Vehicles_Tenants_TenantId;
ALTER TABLE ApplicationUsers DROP CONSTRAINT FK_ApplicationUsers_Tenants_TenantId;
");
        }
    }
}
