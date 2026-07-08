using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;
using StartupBackend.Services;

namespace StartupBackend.Controllers
{
    [Route("manager/members")] // Định tuyến theo bảng API của bạn
    [ApiController]
    [Authorize]
    public class ManagerMembersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService; // Dùng Service của Khoa để gửi mail

        public ManagerMembersController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // 1. Lấy danh sách thành viên (Hỗ trợ tìm kiếm, lọc trạng thái/vai trò)
        [HttpGet]
        public async Task<IActionResult> GetMembers([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int? roleId)
        {
            var query = _context.TaiKhoans
                .Include(a => a.VaiTro)
                .Include(a => a.PhanCongBienSoans)
                .ThenInclude(p => p.MonHoc)
                .Where(a => a.VaiTroId != 1 && a.TrangThai != "Đã xóa") // Không lấy Admin và tài khoản đã xóa
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(a => a.HoTenNguoiDung.ToLower().Contains(s) || a.TenDangNhap.ToLower().Contains(s));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.TrangThai == status);
            }

            if (roleId.HasValue)
            {
                query = query.Where(a => a.VaiTroId == roleId);
            }

            var data = await query.Select(a => new ManagerMemberResponse
            {
                Id = a.Id,
                Username = a.TenDangNhap,
                FullName = a.HoTenNguoiDung,
                Email = a.Email,
                RoleName = a.VaiTro.TenVaiTro,
                HocHam = a.HocHam,
                HocVi = a.HocVi,
                TrinhDoChuyenMon = a.TrinhDoChuyenMon,
                Status = a.TrangThai,
                // Lấy tên các môn học đã được phân công để hiện lên cột "Phân công"
                PhanCong = string.Join(", ", a.PhanCongBienSoans.Select(p => p.MonHoc.TenMonHoc))
            }).ToListAsync();

            return Ok(new { data });
        }

        // 2. Tạo tài khoản thành viên mới
        [HttpPost]
        public async Task<IActionResult> CreateMember([FromBody] ManagerCreateMemberRequest request)
        {
            if (await _context.TaiKhoans.AnyAsync(u => u.TenDangNhap == request.Username))
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại!" });

            var newMember = new Accounts
            {
                TenDangNhap = request.Username,
                HoTenNguoiDung = request.FullName,
                Email = request.Email,
                VaiTroId = request.RoleId,
                HocHam = request.HocHam,
                HocVi = request.HocVi,
                TrinhDoChuyenMon = request.TrinhDoChuyenMon,
                TrangThai = "Hoạt động",
                MatKhau = BCrypt.Net.BCrypt.HashPassword("abc123"), // Mật khẩu mặc định như code Khoa
                TenantId = "HCMCOU", // Gán mặc định theo hệ thống
                NgayTao = DateTime.UtcNow
            };

            _context.TaiKhoans.Add(newMember);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tạo tài khoản thành công!", id = newMember.Id });
        }

        // 3. Lấy chi tiết 1 thành viên
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMemberDetail(int id)
        {
            var member = await _context.TaiKhoans.FindAsync(id);
            if (member == null) return NotFound(new { message = "Không tìm thấy thành viên!" });
            return Ok(member);
        }

        // 4. Cập nhật tài khoản thành viên
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, [FromBody] ManagerUpdateMemberRequest request)
        {
            var member = await _context.TaiKhoans.FindAsync(id);
            if (member == null) return NotFound(new { message = "Không tìm thấy thành viên!" });

            member.HoTenNguoiDung = request.FullName ?? member.HoTenNguoiDung;
            member.Email = request.Email ?? member.Email;
            member.HocHam = request.HocHam ?? member.HocHam;
            member.HocVi = request.HocVi ?? member.HocVi;
            member.TrinhDoChuyenMon = request.TrinhDoChuyenMon ?? member.TrinhDoChuyenMon;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // 5. Xóa tài khoản thành viên (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.TaiKhoans.FindAsync(id);
            if (member == null) return NotFound(new { message = "Không tìm thấy thành viên!" });

            member.TrangThai = "Đã xóa"; // Giống logic của Khoa
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa tài khoản!" });
        }

        // 6. Gửi mail hàng loạt cho danh sách ID được chọn
        [HttpPost("bulk-send-email")]
        public async Task<IActionResult> BulkSendEmail([FromBody] BulkActionRequest request)
        {
            var members = await _context.TaiKhoans
                .Where(a => request.AccountIds.Contains(a.Id))
                .ToListAsync();

            foreach (var member in members)
            {
                string body = $"<h3>Chào {member.HoTenNguoiDung}</h3><p>Tài khoản của bạn đã sẵn sàng trên hệ thống.</p>";
                await _emailService.SendEmailAsync(member.Email, "Thông tin tài khoản", body);
            }

            return Ok(new { message = $"Đã gửi email thành công cho {members.Count} thành viên!" });
        }

        // 7. Thu hồi quyền hàng loạt
        [HttpPatch("bulk-revoke")]
        public async Task<IActionResult> BulkRevoke([FromBody] BulkActionRequest request)
        {
            var members = await _context.TaiKhoans
                .Where(a => request.AccountIds.Contains(a.Id))
                .ToListAsync();

            foreach (var member in members)
            {
                member.TrangThai = "Đã thu hồi";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã thu hồi quyền của {members.Count} tài khoản!" });
        }
    }
}