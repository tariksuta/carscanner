using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleTechSpecsAndDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Fuel",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Gear",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "InsuranceExpiry",
                table: "Vehicles",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PowerKw",
                table: "Vehicles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "RegistrationExpiry",
                table: "Vehicles",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Seats",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 5);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fuel",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Gear",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "InsuranceExpiry",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "PowerKw",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "RegistrationExpiry",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Seats",
                table: "Vehicles");
        }
    }
}
