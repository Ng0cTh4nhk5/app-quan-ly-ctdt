using System.ComponentModel.DataAnnotations;

namespace StartupBackend.DTOs
{
    public class ProgramsDTOs
    {
        public string MaCTDT { get; set; }
        public string TenCTDT { get; set; } 
        public string TrinhDo { get; set; }
    }

    public class ProgramViewModel
    {
        public string MaCTDT { get; set; } = null!;
        public string TenCTDT { get; set; } = null!;
        public string TrinhDo { get; set; } = null!;
        public string? HinhThuc { get; set; }
        public string TrangThai { get; set; } = null!;
    }

    public class CreateProgramDTO
    {
        // Theo Figma, form thêm mới có 4 trường này
        [Required(ErrorMessage = "Vui lòng chọn Ngành đào tạo")]
        public string NganhDaoTao { get; set; } = null!;

        [Required(ErrorMessage = "Vui lòng chọn Trình độ đào tạo")]
        public string TrinhDo { get; set; } = null!;

        public string? HinhThuc { get; set; }
        public DateTime? NamApDung { get; set; }

        [Required(ErrorMessage = "Mã CTĐT không được để trống")]
        public string MaCTDT { get; set; } = null!;

        [Required(ErrorMessage = "Tên CTĐT không được để trống")]
        public string TenCTDT { get; set; } = null!;
    }

    public class UpdateProgramDTO
    {
        public string TenCTDT { get; set; } = null!;
        public string? TenCTDTEng { get; set; }
        public string TrinhDo { get; set; } = null!;
        public string? HinhThuc { get; set; }
        public string TrangThai { get; set; } = null!;
        public string? NganhDaoTao { get; set; }
        public DateTime? NamApDung { get; set; }
    }
}
