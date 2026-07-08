using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;
using System.Security.Claims;

namespace StartupBackend.Controllers
{
    [Route("api/programs")]
    [ApiController]
    [Authorize] 
    public class ProgramsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProgramsController(AppDbContext context)
        {
            _context = context;
        }

// api thêm chương trình đào tạo mới
        [HttpPost]
        [Authorize(Roles="ADMIN,MANAGER")]
        public async Task<IActionResult> CreateProgram([FromBody] CreateProgramDTO request)
        {
            try
            {
                // kiểm tra trùng Mã CTĐT
                if (await _context.ChuongTrinhDaoTaos.AnyAsync(p => p.MaCTDT == request.MaCTDT))
                {
                    return BadRequest(new { message = "Mã Chương trình đào tạo đã tồn tại!" });
                }

                //lấy thông tin Tài khoản người đang thao tác từ Token
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(new { message = "Không xác định được người dùng!" });

                int currentUserId = int.Parse(userIdClaim);
                var currentUser = await _context.TaiKhoans.FindAsync(currentUserId);

                if (currentUser == null) return Unauthorized(new { message = "Tài khoản không tồn tại!" });

                //if (currentUser.VaiTroId != 1 && currentUser.VaiTroId != 2)
                //{
                //    return StatusCode(403, new { message = "Bạn không có quyền tạo Chương trình đào tạo!" });
                //}

                var creatorNameClaim = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(ClaimTypes.Email);
                var nguoiTao = creatorNameClaim ?? "System";

                // tạo mới CTĐT
                var newProgram = new Programs
                {
                    MaCTDT = request.MaCTDT,
                    TenCTDT = request.TenCTDT,
                    NganhDaoTao = request.NganhDaoTao,
                    TrinhDo = request.TrinhDo,
                    HinhThuc = request.HinhThuc,
                    NamApDung = request.NamApDung,
                    TrangThai = "Đang soạn",
                    NguoiTao = nguoiTao,
                    NgayTao = DateTime.UtcNow,
                    NgaySuaDoi = DateTime.UtcNow
                };

                _context.ChuongTrinhDaoTaos.Add(newProgram);

                // Tự động gán Mã CTĐT cho Quản lý nếu họ chưa có
                if (string.IsNullOrWhiteSpace(currentUser.MaCTDT))
                {
                    currentUser.MaCTDT = newProgram.MaCTDT;
                }

                await _context.SaveChangesAsync();

                return StatusCode(201, new { message = "Tạo mới thành công!", maCTDT = newProgram.MaCTDT });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi hệ thống khi tạo mới chương trình đào tạo!", chiTietLoi = errorMessage });
            }
        }

        // api lấy danh sách chương trình đào tạo
        [HttpGet]
        public async Task<IActionResult> GetPrograms([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.ChuongTrinhDaoTaos
                    .Where(p => p.TrangThai != "Ngừng hoạt động")
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.ToLower();
                    query = query.Where(p => p.MaCTDT.ToLower().Contains(search)
                                          || p.TenCTDT.ToLower().Contains(search));
                }

                var totalCount = await query.CountAsync();
                var programs = await query
                    .OrderByDescending(p => p.NgayTao)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProgramViewModel
                    {
                        MaCTDT = p.MaCTDT,
                        TenCTDT = p.TenCTDT,
                        TrinhDo = p.TrinhDo,
                        HinhThuc = p.HinhThuc,
                        TrangThai = p.TrangThai
                    })
                    .ToListAsync();

                return Ok(new { data = programs, totalCount, page, pageSize });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi hệ thống khi tải danh sách chương trình đào tạo!", chiTietLoi = errorMessage });
            }
        }


// tim chuong trinh dao tao theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProgramById(string id)
        {
            try
            {
                var program = await _context.ChuongTrinhDaoTaos.FirstOrDefaultAsync(p => p.MaCTDT == id && p.TrangThai != "Ngừng hoạt động");
                if (program == null)
                    return NotFound(new { message = "Không tìm thấy chương trình đào tạo!" });

                return Ok(program);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi hệ thống khi lấy chi tiết chương trình đào tạo!", chiTietLoi = errorMessage });
            }
        }

// api cập nhật chương trình đào tạo
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProgram(string id, [FromBody] UpdateProgramDTO request)
        {
            try
            {
                var program = await _context.ChuongTrinhDaoTaos.FindAsync(id);
                if (program == null)
                    return NotFound(new { message = "Không tìm thấy chương trình đào tạo!" });

                var updaterClaim = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(ClaimTypes.Email);

                program.TenCTDT = request.TenCTDT;
                program.TenCTDTEng = request.TenCTDTEng;
                program.TrinhDo = request.TrinhDo;
                program.HinhThuc = request.HinhThuc;
                program.TrangThai = request.TrangThai;
                program.NganhDaoTao = request.NganhDaoTao;
                program.NamApDung = request.NamApDung;

                program.NguoiSuaDoi = updaterClaim;
                program.NgaySuaDoi = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật chương trình đào tạo!", chiTietLoi = errorMessage });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN,MANAGER")] 
        public async Task<IActionResult> SoftDeleteProgram(string id)
        {
            try
            {
                // tìm CTĐT dưới DB
                var program = await _context.ChuongTrinhDaoTaos.FindAsync(id);

                if (program == null)
                    return NotFound(new { message = "Không tìm thấy chương trình đào tạo!" });

                // kiểm tra xem nó đã bị xóa từ trước chưa
                if (program.TrangThai == "Ngừng hoạt động")
                {
                    return BadRequest(new { message = "Chương trình đào tạo này đã bị xóa trước đó!" });
                }

                // lấy thông tin người thao tác từ Token
                var updaterClaim = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(ClaimTypes.Email);

                program.TrangThai = "Ngừng hoạt động";

                // lưu vết lại ai là người "xóa" và xóa lúc nào
                program.NguoiSuaDoi = updaterClaim ?? "System";
                program.NgaySuaDoi = DateTime.UtcNow;

                // Lưu thay đổi xuống Database
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã xóa chương trình đào tạo thành công!" });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Lỗi hệ thống khi xóa chương trình đào tạo!", chiTietLoi = errorMessage });
            }
        }
    }
}