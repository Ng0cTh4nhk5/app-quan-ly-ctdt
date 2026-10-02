using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace StartupBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // HÀM 1: ĐĂNG NHẬP
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.TaiKhoans
                .Include(u => u.VaiTro)
                .FirstOrDefaultAsync(u => u.TenDangNhap == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhau))
                throw new Exception("Unauthorized: Sai tên đăng nhập hoặc mật khẩu");

            if (user.TrangThai != "Hoạt động")
                throw new Exception("Forbidden: Tài khoản đang bị khóa");

            // Nếu pass đúng thì gọi hàm sinh Token
            return await GenerateTokensAsync(user);
        }

        // HÀM 2: DÙNG REFRESH TOKEN ĐỂ ĐỔI LẤY JWT MỚI
        public async Task<LoginResponse> RefreshTokenAsync(string refreshToken)
        {
            var tokenRecord = await _context.RefreshTokens
                .Include(rt => rt.User)
                .ThenInclude(u => u.VaiTro)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenRecord == null || tokenRecord.IsRevoked || tokenRecord.ExpiresAt < DateTime.UtcNow)
                throw new Exception("InvalidToken: Refresh Token không hợp lệ hoặc đã hết hạn");

            tokenRecord.IsRevoked = true;

            return await GenerateTokensAsync(tokenRecord.User!);
        }

        // HÀM 3: THU HỒI TOKEN (DÙNG KHI LOGOUT)
        public async Task<bool> RevokeTokenAsync(string refreshToken)
        {
            var tokenRecord = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenRecord == null) return false;

            tokenRecord.IsRevoked = true;
            await _context.SaveChangesAsync();
            return true;
        }

        // HÀM BÍ MẬT: LOGIC TẠO 2 CÁI TOKEN
        private async Task<LoginResponse> GenerateTokensAsync(Accounts user)
        {
            // 1. Tạo thẻ JWT (Hạn đúng 1 GIỜ)
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.TenDangNhap),
                    new Claim(ClaimTypes.Role, user.VaiTro.TenVaiTro)
                }),
                Expires = DateTime.UtcNow.AddHours(1), 
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            // 2. Tạo Refresh Token (Hạn 7 NGÀY)
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            var rtRecord = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7), 
                IsRevoked = false
            };

            // Lưu vào Database
            _context.RefreshTokens.Add(rtRecord);
            await _context.SaveChangesAsync();

            // Đóng gói 2 cái token lại gửi về cho Frontend
            return new LoginResponse
            {
                Token = jwt,
                RefreshToken = refreshToken,
                User = new UserInfo
                {
                    Role = user.VaiTro.TenVaiTro,
                    Name = user.HoTenNguoiDung,
                    IsFirstLogin = user.IsFirstLogin
                }
            };
        }
    }
}