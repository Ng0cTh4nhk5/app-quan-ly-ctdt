using Microsoft.AspNetCore.Mvc;
using StartupBackend.Data;

namespace StartupBackend.Controllers
{
    [Route("api/health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HealthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> CheckHealth()
        {
            try
            {
                bool isDbConnected = await _context.Database.CanConnectAsync();

                if (isDbConnected)
                {
                    var response = StartupBackend.DTOs.ApiResponse<object>.Ok(null, "Hệ thống và cơ sở dữ liệu đang hoạt động bình thường.");
                    return Ok(response);
                }

                var errorResponse = StartupBackend.DTOs.ApiResponse<object>.Fail(503, "Máy chủ đang hoạt động nhưng không thể kết nối đến cơ sở dữ liệu.", HttpContext.TraceIdentifier);
                return StatusCode(503, errorResponse);
            }
            catch (Exception ex)
            {
                throw new Exception("Mất kết nối Database: " + ex.Message);
            }
        }
    }
}