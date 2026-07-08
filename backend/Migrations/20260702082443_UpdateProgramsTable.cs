using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StartupBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProgramsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HinhThuc",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NamApDung",
                table: "ChuongTrinhDaoTaos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NganhDaoTao",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgaySuaDoi",
                table: "ChuongTrinhDaoTaos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayTao",
                table: "ChuongTrinhDaoTaos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "NguoiSuaDoi",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NguoiTao",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TenCTDTEng",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThai",
                table: "ChuongTrinhDaoTaos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "TaiKhoans",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MatKhau", "NgayTao" },
                values: new object[] { "$2a$11$MI7VEPRdZ9V3H9p1LU.57OvSFgPjViRCDvgjW/mB5oy1xpjn5PdPu", new DateTime(2026, 7, 2, 8, 24, 40, 681, DateTimeKind.Utc).AddTicks(377) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HinhThuc",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NamApDung",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NganhDaoTao",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NgaySuaDoi",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NgayTao",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NguoiSuaDoi",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "NguoiTao",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "TenCTDTEng",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "ChuongTrinhDaoTaos");

            migrationBuilder.UpdateData(
                table: "TaiKhoans",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MatKhau", "NgayTao" },
                values: new object[] { "$2a$11$QOTcdCJGGY2d0VufiekpIOV/dXPsVT6AV6D3foJHCAO51DcNVQLJa", new DateTime(2026, 5, 2, 14, 9, 15, 189, DateTimeKind.Utc).AddTicks(9042) });
        }
    }
}
