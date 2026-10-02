using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StartupBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TaiKhoans",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_TaiKhoans_UserId",
                        column: x => x.UserId,
                        principalTable: "TaiKhoans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.InsertData(
                table: "TaiKhoans",
                columns: new[] { "Id", "Email", "HoTenNguoiDung", "HocHam", "HocVi", "IsFirstLogin", "MaCTDT", "MaKhoa", "MatKhau", "NgayTao", "NguoiTaoId", "TenDangNhap", "TenantId", "TrangThai", "TrinhDoChuyenMon", "VaiTroId" },
                values: new object[] { 1, "admin@system.com", "Root Admin", null, null, false, null, null, "$2a$11$MI7VEPRdZ9V3H9p1LU.57OvSFgPjViRCDvgjW/mB5oy1xpjn5PdPu", new DateTime(2026, 7, 2, 8, 24, 40, 681, DateTimeKind.Utc).AddTicks(377), null, "admin", "HCMCOU", "Hoạt động", null, 1 });
        }
    }
}
