using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using StartupBackend.Data;
using StartupBackend.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using StartupBackend.Services;

namespace StartupBackend.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

// API đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.TaiKhoans
                .Include(u => u.VaiTro)
                .FirstOrDefaultAsync(u => u.TenDangNhap == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhau))
            {
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu!" });
            }

            if (user.TrangThai != "Hoạt động")
            {
                return Forbid("Tài khoản của bạn đang bị khóa!");
            }

            // Tạo Token JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.TenDangNhap),
                    new Claim(ClaimTypes.Role, user.VaiTro.TenVaiTro)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            
            return Ok(new LoginResponse
            {
                Token = tokenHandler.WriteToken(token),
                User = new UserInfo
                {
                    Role = user.VaiTro.TenVaiTro,
                    Name = user.HoTenNguoiDung
                }
            });
        }

// đổi mật khẩu lần đầu
        [HttpPost("change-password-first")]
        public async Task<IActionResult> ChangePasswordFirst([FromBody] ChangePasswordFirstRequest request)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new { message = "Mật khẩu xác nhận không khớp!" });
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(); 

            var userId = int.Parse(userIdClaim);

            var user = await _context.TaiKhoans.FindAsync(userId);
            if (user == null) return NotFound();

            // băm mật khẩu mới trước khi lưu
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Mật khẩu đã được đổi, hãy đăng nhập lại." });
        }

// quên mật khẩu (/auth/forgot-password)
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                // tìm user theo Email 
                var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return BadRequest(new {message = "Không tìm thấy Email này!"});
                }

                // tạo token chứa email, hạn 15p
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                    Expires = DateTime.UtcNow.AddMinutes(15),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var resetToken = tokenHandler.WriteToken(token);

                // GỬI MAIL THẬT
                var frontendResetUrl = $"http://localhost:3000/reset-password?token={resetToken}"; // Sửa lại link này theo fe

                var emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Yêu cầu đặt lại mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>{user.Email}</strong>.</p>
                    <p>Vui lòng click vào nút bên dưới để tiến hành đổi mật khẩu mới (Liên kết này chỉ có hiệu lực trong 15 phút):</p>
                    
                    <a href='{frontendResetUrl}' style='display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;'>ĐẶT LẠI MẬT KHẨU</a>
                    
                </div>";

                await _emailService.SendEmailAsync(user.Email, "Đặt lại mật khẩu", emailBody);

                return Ok(new { message = "Liên kết đặt lại mật khẩu đã được gửi." });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;

                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi gửi email!",
                    chiTietLoi = errorMessage,
                    stackTrace = ex.StackTrace,
                });
            }
           
        }

// đặt lại mật khẩu (/auth/reset-password)
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

            try
            {
                // giải mã token để lấy thông tin
                tokenHandler.ValidateToken(request.Token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var email = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email || x.Type == "email");
                if(email == null)
                {
                    return BadRequest(new { message = "Lỗi token, không tìm thấy email!" });
                }
                var emailValue = email.Value;

                // tìm user theo email từ token mới giải mã
                var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Email == emailValue);
                if (user == null) return BadRequest(new { message = "Người dùng không tồn tại!" });

                user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error: " + ex.Message });
            }
        }

    }
}
