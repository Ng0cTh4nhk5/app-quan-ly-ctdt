using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartupBackend.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsRevoked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Khóa ngoại liên kết với bảng Accounts (Tài Khoản)
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public Accounts? User { get; set; }
    }
}