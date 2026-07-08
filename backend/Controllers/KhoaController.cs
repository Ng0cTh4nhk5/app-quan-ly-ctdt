using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StartupBackend.Data;
using StartupBackend.DTOs;
using StartupBackend.Models;

namespace StartupBackend.Controllers
{
    [Route("api/faculties")]
    [ApiController]
    [Authorize] 
    public class KhoaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KhoaController(AppDbContext context)
        {
            _context = context;
        }

// api thêmkhoa mới
        [HttpPost]
        public async Task<IActionResult> CreateKhoa([FromBody] KhoaDTOs request)
        {
            // kiểm tra mã khoa
            if (await _context.Khoas.AnyAsync(k => k.MaKhoa == request.MaKhoa))
            {
                return BadRequest(new { message = "Mã khoa này đã tồn tại trong hệ thống!" });
            }

            var newKhoa = new Khoas
            {
                MaKhoa = request.MaKhoa,
                TenKhoa = request.TenKhoa,
                MaCTDT = request.MaCTDT 
            };

            _context.Khoas.Add(newKhoa);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm khoa thành công!", maKhoa = newKhoa.MaKhoa });
        }

// lấy danh sách khoa
        [HttpGet]
        public async Task<IActionResult> GetKhoas()
        {
            var danhSachKhoa = await _context.Khoas.ToListAsync();
            return Ok(danhSachKhoa);
        }
    }
}