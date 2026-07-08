using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartupBackend.Models
{
    public class PhanCongBienSoan
    {
        [Key]
        public int Id { get; set; }

        public DateTime NgayPhanCong { get; set; }

        // Khóa ngoại tới TaiKhoan
        public int NguoiBienSoanId { get; set; }
        [ForeignKey("NguoiBienSoanId")]
        public Accounts NguoiBienSoan { get; set; }

        // Khóa ngoại tới MonHoc
        public string MaMonHoc { get; set; }
        [ForeignKey("MaMonHoc")]
        public Subjects MonHoc { get; set; }
    }
}

