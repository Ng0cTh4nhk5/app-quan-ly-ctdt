using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static StartupBackend.Models.Roles;

namespace StartupBackend.Models
{
    public class Accounts
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string TenDangNhap { get; set; }

        [Required]
        public string MatKhau { get; set; }
        public string Email { get; set; }
        public string HoTenNguoiDung { get; set; }
        public string TrangThai { get; set; }

        // phan quyen theo tenant
        [Required]
        public string TenantId { get; set; }

        // Khóa ngoại tới VaiTro
        public int VaiTroId { get; set; }
        [ForeignKey("VaiTroId")]
        public Roles VaiTro { get; set; }

        // khoa ngoai toi chuong trinh dao tao
        public string? MaCTDT { get; set; }
        [ForeignKey("MaCTDT")]
        public Programs ChuongTrinhDaoTao { get; set; } 

        public string? HocHam { get; set; }
        public string? HocVi { get; set; }
        public string? TrinhDoChuyenMon { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public int? NguoiTaoId { get; set; } 
        public string? MaKhoa { get; set; }
        [ForeignKey("MaKhoa")]
        public Khoas Khoa { get; set; }

        public ICollection<PhanCongBienSoan> PhanCongBienSoans { get; set; }
    }
}

