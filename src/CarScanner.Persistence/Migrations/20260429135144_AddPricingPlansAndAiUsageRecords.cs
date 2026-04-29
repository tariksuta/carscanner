using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarScanner.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingPlansAndAiUsageRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiUsageRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BillingAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DamageReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Feature = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PromptTokens = table.Column<int>(type: "int", nullable: false),
                    CompletionTokens = table.Column<int>(type: "int", nullable: false),
                    TotalTokens = table.Column<int>(type: "int", nullable: false),
                    RawCostUsd = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    ChargedAmount = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorContext = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    OriginalUsageRecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.PrimaryKey("PK_AiUsageRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PricingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    MarkupMultiplier = table.Column<decimal>(type: "decimal(8,4)", precision: 8, scale: 4, nullable: false),
                    EffectiveFromUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveUntilUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_PricingPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PricingPlanModelPricings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PromptCostPerThousandTokens = table.Column<decimal>(type: "decimal(18,8)", precision: 18, scale: 8, nullable: false),
                    CompletionCostPerThousandTokens = table.Column<decimal>(type: "decimal(18,8)", precision: 18, scale: 8, nullable: false),
                    FixedSurchargePerCall = table.Column<decimal>(type: "decimal(18,8)", precision: 18, scale: 8, nullable: true),
                    PricingPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingPlanModelPricings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PricingPlanModelPricings_PricingPlans_PricingPlanId",
                        column: x => x.PricingPlanId,
                        principalTable: "PricingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_BillingAccountId",
                table: "AiUsageRecords",
                column: "BillingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_CreatedAtUtc",
                table: "AiUsageRecords",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_DamageReportId",
                table: "AiUsageRecords",
                column: "DamageReportId");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_Status",
                table: "AiUsageRecords",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_TenantId",
                table: "AiUsageRecords",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_TenantId_CreatedAtUtc",
                table: "AiUsageRecords",
                columns: new[] { "TenantId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_PricingPlanModelPricings_PricingPlanId_Model",
                table: "PricingPlanModelPricings",
                columns: new[] { "PricingPlanId", "Model" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PricingPlans_IsDefault",
                table: "PricingPlans",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_PricingPlans_IsDefault_EffectiveUntilUtc",
                table: "PricingPlans",
                columns: new[] { "IsDefault", "EffectiveUntilUtc" });

            // Seed: default PricingPlan with current OpenAI gpt-4o list prices and 1.5x markup.
            // gpt-4o (2026): $2.50 per 1M input tokens, $10.00 per 1M output tokens.
            // Stored per-1K-tokens for arithmetic convenience.
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM PricingPlans WHERE Id = 'A0000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO PricingPlans (Id, Name, IsDefault, MarkupMultiplier, EffectiveFromUtc, CreatedBy, CreatedOnUtc, IsDeleted)
    VALUES (
        'A0000000-0000-0000-0000-000000000001',
        'Default 2026',
        1,
        1.5,
        SYSUTCDATETIME(),
        '00000000-0000-0000-0000-000000000000',
        SYSUTCDATETIME(),
        0
    );

    INSERT INTO PricingPlanModelPricings (Id, Model, PromptCostPerThousandTokens, CompletionCostPerThousandTokens, FixedSurchargePerCall, PricingPlanId)
    VALUES (
        NEWID(),
        'gpt-4o',
        0.00250000,
        0.01000000,
        NULL,
        'A0000000-0000-0000-0000-000000000001'
    );
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiUsageRecords");

            migrationBuilder.DropTable(
                name: "PricingPlanModelPricings");

            migrationBuilder.DropTable(
                name: "PricingPlans");
        }
    }
}
