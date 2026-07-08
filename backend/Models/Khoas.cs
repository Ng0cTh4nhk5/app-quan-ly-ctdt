using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartupBackend.Models
{
    public class Khoas
    {
        [Key] 
        public string MaKhoa { get; set; }

        public string TenKhoa { get; set; }
        public string? MaCTDT { get; set; }

        [ForeignKey("MaCTDT")]
        public Programs ChuongTrinhDaoTao { get; set; }
    }
}