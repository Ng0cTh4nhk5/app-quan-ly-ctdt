using System.ComponentModel.DataAnnotations;

namespace StartupBackend.Models
{
    public class Programs
    {
        [Key]
        public string MaCTDT { get; set; }
        public string TenCTDT { get; set; }
        public string? TenCTDTEng { get; set; } // ten tieng anh cua CTDT
        public string TrinhDo { get; set; }
        public string? HinhThuc { get; set; }
        public string TrangThai { get; set; }
        public string? NganhDaoTao { get; set; }
        public string NguoiTao { get; set; }
        public string? NguoiSuaDoi { get; set; } = null;
        public DateTime? NamApDung { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.Now;
        public DateTime NgaySuaDoi { get; set; } = DateTime.Now;


        // Navigation properties
        public ICollection<Accounts> TaiKhoans { get; set; }
        public ICollection<Subjects> MonHocs { get; set; }
    }
}
