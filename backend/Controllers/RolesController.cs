using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StartupBackend.Data;
using StartupBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace StartupBackend.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }

// lấy danh sách vai trò
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Roles>>> GetRoles()
        {
            return await _context.VaiTros.ToListAsync();
        }

// Thêm vai trò mới
        [HttpPost]
        public async Task<ActionResult<Roles>> CreateRole(Roles role)
        {
            _context.VaiTros.Add(role);
            await _context.SaveChangesAsync();
            return Ok(role);
        }
    }
}
