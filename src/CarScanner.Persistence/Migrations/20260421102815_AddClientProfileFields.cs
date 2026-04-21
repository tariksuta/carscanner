using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddClientProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "BirthDate",
                table: "Clients",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Clients",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNote",
                table: "Clients",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVip",
                table: "Clients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Jmbg",
                table: "Clients",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MarketingConsent",
                table: "Clients",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "InternalNote",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IsVip",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Jmbg",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "MarketingConsent",
                table: "Clients");
        }
    }
}
