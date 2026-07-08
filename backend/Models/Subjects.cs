using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartupBackend.Models
{
    public class Subjects
    {
        [Key]
        public string MaMonHoc { get; set; }

        [Required]
        public string TenMonHoc { get; set; }
        public int SoTinChiLyThuyet { get; set; } = 0;
        public int SoTinChiThucHanh { get; set; } = 0;
        public string TrangThaiHoanThanh { get; set; }

        // Khóa ngoại tới ChuongTrinhDaoTao
        public string ChuongTrinhDaoTaoMa { get; set; }
        [ForeignKey("ChuongTrinhDaoTaoMa")]
        public Programs ChuongTrinhDaoTao { get; set; }

        public ICollection<PhanCongBienSoan> PhanCongBienSoans { get; set; }
    }
}

