using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;

namespace StartupBackend.Controllers
{
    [Route("api/subjects")]
    [ApiController]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        //Thêm mới môn học
        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] SubjectCreateDTOs request)
        {
            if (await _context.MonHocs.AnyAsync(s => s.MaMonHoc == request.MaMonHoc))
            {
                return BadRequest(new { message = "Mã môn học này đã tồn tại!" });
            }

            var programExists = await _context.ChuongTrinhDaoTaos
                .AnyAsync(p => p.MaCTDT == request.ChuongTrinhDaoTaoMa);

            if (!programExists)
            {
                return BadRequest(new { message = "Mã chương trình đào tạo không hợp lệ!" });
            }

            var newSubject = new Subjects
            {
                MaMonHoc = request.MaMonHoc,
                TenMonHoc = request.TenMonHoc,
                SoTinChiLyThuyet = request.SoTinChiLyThuyet,
                SoTinChiThucHanh = request.SoTinChiThucHanh,
                TrangThaiHoanThanh = request.TrangThaiHoanThanh,
                ChuongTrinhDaoTaoMa = request.ChuongTrinhDaoTaoMa
            };

            // 4. Lưu vào Database
            try
            {
                _context.MonHocs.Add(newSubject);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Thêm môn học thành công!", data = newSubject.MaMonHoc });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Lấy danh sách môn học được phân công cho người biên soạn
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMyAssignedSubjects()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "Không tìm thấy thông tin đăng nhập" });
            int currentUserId = int.Parse(userIdClaim.Value);
            var assignedSubjects = await _context.MonHocs
                .Where(s => s.PhanCongBienSoans.Any(pc => pc.NguoiBienSoanId == currentUserId))
                .Select(s => new {
                    s.MaMonHoc,
                    s.TenMonHoc,
                    SoTinChi = s.SoTinChiLyThuyet + s.SoTinChiThucHanh,
                    s.TrangThaiHoanThanh,
                    TenChuongTrinh = s.ChuongTrinhDaoTao.TenCTDT
                })
                .ToListAsync();

            return Ok(assignedSubjects);
        }
    }
}