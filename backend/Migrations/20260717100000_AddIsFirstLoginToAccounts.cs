using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartupBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsFirstLoginToAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFirstLogin",
                table: "TaiKhoans",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFirstLogin",
                table: "TaiKhoans");
        }
    }
}
