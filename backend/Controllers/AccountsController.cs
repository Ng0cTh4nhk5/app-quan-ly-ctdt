using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Update;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;
using System.Security.Claims;

namespace StartupBackend.Controllers
{
    [Route("api/accounts")]
    [ApiController]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }

        // tạo tài khoản mới
        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] AccountDTOs request)
        {
            try
            {
                var creatorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (creatorIdClaim == null) return Unauthorized(new { message = "Không xác định được người dùng!" });

                int creatorId = int.Parse(creatorIdClaim);

                var creator = await _context.TaiKhoans.FindAsync(creatorId);
                if (creator == null) return Unauthorized();

                if (_context.TaiKhoans.Any(u => u.TenDangNhap == request.Username))
                    return BadRequest(new { message = "Tên đăng nhập đã tồn tại!" });

                if (_context.TaiKhoans.Any(u => u.Email == request.Email))
                    return BadRequest(new { message = "Email đã tồn tại!" });

                //logic xử lí mã CTĐT
                var programId = request.Programs;

                if (programId == null || programId.ToString() == "")
                    programId = creator.MaCTDT; // tài khoản được tạo sẽ được thừa hưởng ctđt của người tạo
                
                if (string.IsNullOrWhiteSpace(programId?.ToString()))
                    programId = null; // nếu là chuỗi rỗng thì set về null

                if (programId != null)
                {
                    var isProgramExists = await _context.ChuongTrinhDaoTaos.AnyAsync(p => p.MaCTDT == programId);
                    if (!isProgramExists)
                    {
                        return BadRequest(new { message = "Mã chương trình đào tạo không tồn tại!" });
                    }
                }
                var newAccount = new Accounts
                {
                    TenDangNhap = request.Username,
                    Email = request.Email,
                    HoTenNguoiDung = request.FullName,
                    VaiTroId = request.RoleId,
                    MaKhoa = request.Khoa,
                    TrangThai = "Hoạt động",
                    MaCTDT = programId,
                    HocHam = request.HocHam,
                    HocVi = request.HocVi,
                    TrinhDoChuyenMon = request.TrinhDoChuyenMon,

                    // mật khẩu mặc định
                    MatKhau = BCrypt.Net.BCrypt.HashPassword("abc123"),

                    TenantId = creator.TenantId,
                    NgayTao = DateTime.UtcNow,
                    NguoiTaoId = creator.Id
                };

                _context.TaiKhoans.Add(newAccount);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tạo tài khoản thành công!", accountId = newAccount.Id });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi tạo tài khoản!",
                    chiTietLoi = errorMessage
                });
            }
        }

// lấy danh sách tài khoản
        [HttpGet]
        public async Task<IActionResult> GetAccounts(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 4,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
            var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToUpper();

            int.TryParse(currentUserIdString, out int currentUserId);

            int currentRoleId = currentUserRole switch
            {
                "ADMIN" => 1,
                "MANAGER" => 2,
                _ => 3 // COMPILER
            };
            var query = _context.TaiKhoans
                .Include(a => a.VaiTro)
                .Include(a => a.ChuongTrinhDaoTao)
                .AsQueryable();

            query = query.Where(a => a.VaiTroId != 1);
            query = query.Where(a => a.TrangThai != "Đã xóa");

            if (currentRoleId == 1)
            {
            }
            else
            {
                query = query.Where(a => a.VaiTroId > currentRoleId && a.NguoiTaoId == currentUserId);
            }

            // logic: nếu Frontend có truyền search thì mới filter, nếu ko thì show tất cả
            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(a => a.TenDangNhap.ToLower().Contains(s) || a.HoTenNguoiDung.ToLower().Contains(s));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.TrangThai == status);
            }

            // phân trang
            var totalItems = await query.CountAsync();
            var data = await query
                .OrderByDescending(a => a.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(a => new AccountResponse
                {
                    Id = a.Id,
                    Username = a.TenDangNhap,
                    FullName = a.HoTenNguoiDung,
                    Email = a.Email,
                    Role = a.VaiTro.TenVaiTro,
                    Programs = a.ChuongTrinhDaoTao.MaCTDT,
                    ProgramsName = a.ChuongTrinhDaoTao.TenCTDT,
                    Khoa = a.Khoa.TenKhoa,
                    HocHam = a.HocHam,
                    HocVi = a.HocVi,
                    TrinhDoChuyenMon = a.TrinhDoChuyenMon,
                    Status = a.TrangThai
                })
                .ToListAsync();

            return Ok(new { total = totalItems, data });
        }

// cập nhật tài khoản
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountRequest request)
        {
            var account = await _context.TaiKhoans.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản!" });

            // check role của người đang sửa
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToUpper();
            int currentRoleId = currentUserRole switch { "ADMIN" => 1, "MANAGER" => 2, _ => 3 };

            // nếu người sửa có quyền thấp hơn hoặc bằng người bị sửa -> báo lỗi
            var currentUserIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(currentUserIdString, out int currentUserId);

            if (currentRoleId > 1 && account.VaiTroId <= currentRoleId && account.Id != currentUserId)
            {
                return StatusCode(403, new { message = "Bạn không có quyền sửa tài khoản cấp cao hơn hoặc ngang hàng!" });
            }

            // check trung username
            if (!string.IsNullOrEmpty(request.Username) && request.Username != account.TenDangNhap)
            {
                bool isUsernameTaken = await _context.TaiKhoans
                    .AnyAsync(a => a.TenDangNhap.ToLower() == request.Username.ToLower());

                if (isUsernameTaken)
                {
                    return BadRequest(new { message = "Tên đăng nhập này đã được sử dụng!" });
                }

                var forbiddenNames = new[] { "admin", "root", "system" };
                if (forbiddenNames.Contains(request.Username.ToLower()) && currentRoleId != 1)
                {
                    return BadRequest(new { message = "Từ khóa này đã được sử dụng!" });
                }

                account.TenDangNhap = request.Username;
            }

            account.HoTenNguoiDung = request.FullName ?? account.HoTenNguoiDung;
            account.Email = request.Email ?? account.Email;
            account.MaCTDT = request.ProgramsId ?? account.MaCTDT;
            account.MaKhoa = request.Khoa ?? account.MaKhoa;
            account.HocHam = request.HocHam ?? account.HocHam;
            account.HocVi = request.HocVi ?? account.HocVi;
            account.TrinhDoChuyenMon = request.TrinhDoChuyenMon ?? account.TrinhDoChuyenMon;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật tài khoản thành công!" });
        }

// xóa tài khoản
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.TaiKhoans.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản!" });

            // cấm xóa root admin
            if (account.VaiTroId == 1 && account.TenDangNhap.ToLower() == "admin")
            {
                return BadRequest(new { message = "Không thể xóa tài khoản này!" });
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToUpper();
            int currentRoleId = currentUserRole switch { "ADMIN" => 1, "MANAGER" => 2, _ => 3 };

            if (currentRoleId > 1 && account.VaiTroId <= currentRoleId)
            {
                return StatusCode(403, new { message = "Bạn không có quyền xóa tài khoản này!" });
            }

            // đổi trạng thái hoạt động thay vì xóa hẳn
            account.TrangThai = "Đã xóa";

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa tài khoản {account.TenDangNhap}!" });
        }
    }
}
