using System.ComponentModel.DataAnnotations;

namespace StartupBackend.Models
{
    public class Roles
    {
            [Key]
            public int Id { get; set; }
            public string TenVaiTro { get; set; }

            // Navigation property: 1 Vai trò có nhiều Tài khoản
            public ICollection<Accounts> TaiKhoans { get; set; }
        
    }
}
