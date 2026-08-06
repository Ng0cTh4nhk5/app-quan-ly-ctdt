using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartupBackend.Migrations
{
    /// <inheritdoc />
    public partial class Clean_Dynamic_Seed_Data : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TaiKhoans",
                keyColumn: "Id",
                keyValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TaiKhoans",
                columns: new[] { "Id", "Email", "HoTenNguoiDung", "HocHam", "HocVi", "IsFirstLogin", "MaCTDT", "MaKhoa", "MatKhau", "NgayTao", "NguoiTaoId", "TenDangNhap", "TenantId", "TrangThai", "TrinhDoChuyenMon", "VaiTroId" },
                values: new object[] { 1, "admin@system.com", "Root Admin", null, null, false, null, null, "$2a$11$MI7VEPRdZ9V3H9p1LU.57OvSFgPjViRCDvgjW/mB5oy1xpjn5PdPu", new DateTime(2026, 7, 2, 8, 24, 40, 681, DateTimeKind.Utc).AddTicks(377), null, "admin", "HCMCOU", "Hoạt động", null, 1 });
        }
    }
}
