# EPIC 1: Security & Foundation Fix: Implementation Guide

**Sprint 0: Tuần 1 đến Tuần 2** | **Priority: 🔴 P0 Blocker**
**Tham chiếu:** [Task Breakdown](../audit-reports/task_breakdown.md) · [Code Standards](./convention/00-code-standards.md)

> [!CAUTION]
> Sprint này **KHÔNG ship feature mới**. Mục tiêu duy nhất: fix security holes + unblock development.

---

## Story 1.1: Bảo mật Secrets & Config 🔴

**Mục tiêu:** Loại bỏ toàn bộ secrets khỏi source code
**Dependencies:** Không: đây là task đầu tiên
**Branch:** `bugfix/CARD-XX-secrets-migration`

### Hiện trạng (Vấn đề)

Các secrets đang hardcoded trong git tracked files:

```csharp
// Program.cs, dòng 25: JWT Secret hardcoded fallback
IssuerSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] 
        ?? "Mot_chuoi_ki_tu_bi_mat_cuc_ky_dai_va_kho_doan_khoang_32_ki_tu_nhe"))
```

```csharp
// Services/EmailService.cs: SMTP password có thể hardcoded
```

```javascript
// Frontend: LoginPage.jsx: EmailJS keys hardcoded
```

### Task 1.1.1: [BE] Chuyển JWT Secret → `appsettings.{env}.json` + `dotnet user-secrets`

**File cần sửa:** `appsettings.json`, `appsettings.Development.json`, `Program.cs`

**Từng bước:**

1. Tạo file `appsettings.Development.json`:
```json
{
  "Jwt": {
    "Key": "DEV_ONLY_secret_key_minimum_32_characters_long_!!!",
    "Issuer": "TPMS-AI-Dev",
    "Audience": "TPMS-AI-Client",
    "ExpiryInHours": 1
  }
}
```

2. Cập nhật `appsettings.json`: **xóa secret, chỉ giữ placeholder:**
```json
{
  "Jwt": {
    "Key": "CHANGE_ME_IN_ENVIRONMENT",
    "Issuer": "TPMS-AI",
    "Audience": "TPMS-AI-Client",
    "ExpiryInHours": 1
  }
}
```

3. Sửa `Program.cs`: **bỏ fallback hardcoded:**
```csharp
// XÓA dòng này:
// ?? "Mot_chuoi_ki_tu_bi_mat_cuc_ky_dai..."

// THAY bằng:
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is not configured!");

options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,        // BẬT: xem thêm Task 1.2.1
    ValidateAudience = true,      // BẬT
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = builder.Configuration["Jwt:Issuer"],
    ValidAudience = builder.Configuration["Jwt:Audience"],
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
};
```

4. Setup `dotnet user-secrets` cho development:
```bash
cd apps/backend
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "your_actual_secret_key_min_32_chars_here"
```

**Acceptance test:**
- [ ] Không còn string secret nào trong git history (dùng `git log -p -- appsettings.json`)
- [ ] App start thành công với `dotnet user-secrets`
- [ ] App fail với error rõ ràng nếu thiếu JWT Key---### Task 1.1.2: [BE] Chuyển SMTP password → env var
**File cần sửa:** `Services/EmailService.cs`, `appsettings.json`

**Từng bước:**

1. Thêm config vào `appsettings.json`:
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "noreply@tpms.edu.vn",
    "SenderPassword": "CHANGE_ME_IN_ENVIRONMENT"
  }
}
```

2. Sửa `EmailService.cs`: inject `IConfiguration`:
```csharp
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _config["Email:SmtpHost"];
        var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var senderEmail = _config["Email:SenderEmail"];
        var senderPassword = _config["Email:SenderPassword"]
            ?? throw new InvalidOperationException("SMTP password not configured!");
        
        // ... SMTP logic
    }
}
```

3. Set user secret cho dev:
```bash
dotnet user-secrets set "Email:SenderPassword" "your_app_password_here"
```

**Acceptance test:**
- [ ] `EmailService` đọc password từ `IConfiguration`
- [ ] Không còn password hardcoded trong source---### Task 1.1.3: [FE] Chuyển EmailJS keys → `.env`
**File cần sửa:** `LoginPage.jsx`, tạo `.env`, `.env.example`

**Từng bước:**

1. Tạo `.env` (git ignored):
```env
VITE_API_URL=https://your-api-url.com
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

2. Tạo `.env.example` (git tracked):
```env
VITE_API_URL=http://localhost:5000
VITE_EMAILJS_SERVICE_ID=CHANGE_ME
VITE_EMAILJS_TEMPLATE_ID=CHANGE_ME
VITE_EMAILJS_PUBLIC_KEY=CHANGE_ME
```

3. Sửa code: thay hardcoded bằng `import.meta.env`:
```tsx
// XÓA: emailjs.send('service_xxx', 'template_xxx', data, 'key_xxx')
// THAY:
emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  data,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
```

4. Thêm vào `.gitignore`:
```
.env
.env.local
```

**Acceptance test:**
- [ ] Không còn hardcoded key trong source
- [ ] `.env.example` có placeholder cho mọi env var---### Task 1.1.4 đến 1.1.5: [DEVOPS] Env example + Pre commit hook
**Task 1.1.4:** Tạo `.env.example` cho cả BE + FE (đã mô tả ở trên)

**Task 1.1.5:** Pre commit hook chặn secrets

1. Tạo file `.githooks/pre-commit`:
```bash
#!/bin/sh
# Detect potential secrets in staged files
PATTERNS='password=|secret=|api_key=|private_key=|-----BEGIN'

if git diff --cached --diff-filter=ACM | grep -iE "$PATTERNS"; then
    echo "BLOCKED: Possible secret detected in staged files!"
    echo "   Please move secrets to .env or user-secrets."
    exit 1
fi
exit 0
```

2. Kích hoạt:
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

---

## Story 1.2: Fix JWT & CORS 🔴

**Mục tiêu:** JWT validation đúng chuẩn + CORS chỉ cho phép FE domain
**Dependencies:** Story 1.1 (secrets đã chuyển)
**Branch:** `bugfix/CARD-XX-jwt-cors`

### Task 1.2.1: [BE] Bật ValidateIssuer + ValidateAudience

> Đã thực hiện trong Task 1.1.1. Chỉ cần verify token validation parameters đã đúng.

**Acceptance test:**
- [ ] Unit test: Token với sai Issuer → bị reject
- [ ] Unit test: Token với sai Audience → bị reject---### Task 1.2.2: [BE] Giảm JWT expiry → 1h + Refresh Token
**File cần tạo/sửa:** `Controllers/AuthController.cs`, `Services/Interfaces/IAuthService.cs`, `Services/Implementations/AuthService.cs`, `Models/RefreshToken.cs`

**Step 1: Tạo model `RefreshToken`:**
```csharp
// Models/RefreshToken.cs
public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRevoked { get; set; } = false;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
```

**Step 2: Thêm vào DbContext:**
```csharp
public DbSet<RefreshToken> RefreshTokens { get; set; }
```

**Step 3: Tạo IAuthService + AuthService:**
```csharp
// Services/Interfaces/IAuthService.cs
public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task RevokeTokenAsync(string refreshToken);
}
```

```csharp
// Services/Implementations/AuthService.cs
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.TaiKhoans
            .Include(u => u.VaiTro)
            .FirstOrDefaultAsync(u => u.TenDangNhap == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhau))
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var stored = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken);

        if (stored == null || stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");

        // Revoke token cũ
        stored.IsRevoked = true;

        // Tạo token mới
        var newAccessToken = GenerateJwtToken(stored.User);
        var newRefreshToken = GenerateRefreshToken(stored.UserId);
        _context.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
        };
    }

    private string GenerateJwtToken(Accounts user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.TenDangNhap),
            new Claim(ClaimTypes.Role, user.VaiTro.TenVaiTro),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private RefreshToken GenerateRefreshToken(int userId)
    {
        return new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        };
    }
}
```

**Step 4: Controller endpoint:**
```csharp
[HttpPost("refresh")]
[AllowAnonymous]
public async Task<ActionResult<ApiResponse<AuthResponse>>> Refresh(
    [FromBody] RefreshTokenRequest request)
{
    var result = await _authService.RefreshTokenAsync(request);
    return Ok(ApiResponse<AuthResponse>.Success(result));
}
```

**Acceptance test:**
- [ ] `POST /api/auth/login` trả JWT (1h) + Refresh Token (7d)- [ ] `POST /api/auth/refresh` trả JWT mới + Refresh Token mới- [ ] Token cũ bị revoke sau khi refresh- [ ] Refresh token hết hạn → trả 401---### Task 1.2.3: [BE] CORS whitelist
**File sửa:** `Program.cs`

```csharp
// XÓA:
// options.AddPolicy("AllowAll", policy => {
//     policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
// });

// THAY:
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();   // cần cho SignalR sau này
    });
});

// ...
app.UseCors("FrontendOnly");
```

Thêm vào `appsettings.json`:
```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

Thêm vào `appsettings.Production.json`:
```json
{
  "Cors": {
    "AllowedOrigins": ["https://tpms.yourdomain.com"]
  }
}
```

**Acceptance test:**
- [ ] `AllowAnyOrigin()` đã bị xóa
- [ ] Request từ domain không nằm trong whitelist → bị CORS block---### Task 1.2.4: [FE] Tự động làm mới token trong axiosInstance
**File sửa:** `services/axiosInstance.js` → rename thành `services/axiosInstance.ts`

```typescript
// services/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data.data;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Redirect to login
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

**Acceptance test:**
- [ ] Token hết hạn → tự refresh transparent, user không bị đẩy ra login
- [ ] Refresh token hết hạn → redirect về login
- [ ] Nhiều request đồng thời bị 401 → chỉ gọi refresh 1 lần (queue pattern)---## Story 1.3: Global Error Handling 🔴
**Mục tiêu:** Chặn stack trace leak, response format thống nhất
**Dependencies:** Không
**Branch:** `feature/CARD-XX-error-handling`

### Task 1.3.1: [BE] ExceptionHandlingMiddleware

**File tạo mới:** `Middleware/ExceptionHandlingMiddleware.cs`

```csharp
using System.Net;
using System.Text.Json;

namespace StartupBackend.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        var (statusCode, message) = exception switch
        {
            UnauthorizedException => (HttpStatusCode.Unauthorized, exception.Message),
            ForbiddenException => (HttpStatusCode.Forbidden, exception.Message),
            NotFoundException => (HttpStatusCode.NotFound, exception.Message),
            BadRequestException => (HttpStatusCode.BadRequest, exception.Message),
            _ => (HttpStatusCode.InternalServerError, "Lỗi hệ thống. Vui lòng thử lại sau.")
        };

        // Log chi tiết (chỉ server thấy)
        _logger.LogError(exception, "Unhandled exception | TraceId: {TraceId}", traceId);

        // Response cho client (KHÔNG có stack trace)
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            message,
            traceId,
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}

// Custom exceptions
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}
```

**Đăng ký trong `Program.cs`:**
```csharp
// Thêm TRƯỚC app.UseAuthentication()
app.UseMiddleware<ExceptionHandlingMiddleware>();
```

**Acceptance test:**
- [ ] Exception bất kỳ → trả JSON chuẩn `{success, statusCode, message, traceId}`- [ ] Stack trace KHÔNG bao giờ leak ra response- [ ] Server log có đầy đủ stack trace để debug---### Task 1.3.2: [BE] ApiResponse<T> wrapper
> Đã mô tả trong [Code Standards §4.2](./convention/00-code-standards.md#42-backend--apiresponset-standard). Copy class `ApiResponse<T>` vào `DTOs/Responses/ApiResponse.cs`.

---

### Task 1.3.3: [BE] Health Check endpoint

**Thêm vào `Program.cs`:**
```csharp
// Trước app.Run()
app.MapGet("/api/health", async (AppDbContext db) =>
{
    try
    {
        await db.Database.CanConnectAsync();
        return Results.Ok(new { status = "healthy", database = "connected" });
    }
    catch
    {
        return Results.Json(
            new { status = "unhealthy", database = "disconnected" },
            statusCode: 503);
    }
});
```

**Acceptance test:**
- [ ] `GET /api/health` → `200 OK` khi DB connected
- [ ] `GET /api/health` → `503` khi DB disconnected---## Story 1.4: RBAC 5 vai trò Refactor 🔴
**Mục tiêu:** Chuyển từ 3 roles (ADMIN/MANAGER/COMPILER) → 5 roles (PM/TK/GV/HĐ/BGH), User Role Many to Many
**Dependencies:** Story 1.2 (JWT claims cần update theo role mới)
**Branch:** `feature/CARD-XX-rbac-refactor`
**Tham chiếu BA:** [actors_and_permissions.md](../ba/01_requirements/business/actors_and_permissions.md)

### Hiện trạng (Vấn đề)

```
BA spec: 5 roles: PM, TK, GV, HĐ, BGH: Many-to-Many
Code: 3 roles: ADMIN, MANAGER, COMPILER: One-to-One (FK VaiTroId)
```

**Xung đột cụ thể:**
- `Roles` table chỉ có 3 records, tên tiếng Anh không khớp BA- `Accounts.VaiTroId` là FK trực tiếp (1 đến 1), BA yêu cầu M2M- Seed data tạo "Root Admin" role không tồn tại trong BA---### Task 1.4.1: [BE] Tạo bảng `UserRoles` (Many to Many) + migration
**File tạo mới:** `Models/UserRole.cs`

```csharp
// Models/UserRole.cs
namespace StartupBackend.Models;

public class UserRole
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public int? AssignedBy { get; set; }

    // Navigation
    public Accounts User { get; set; } = null!;
    public Roles Role { get; set; } = null!;
}
```

**File sửa:** `Data/AppDbContext.cs`: thêm DbSet + Fluent API

```csharp
// Thêm DbSet
public DbSet<UserRole> UserRoles { get; set; }

// Trong OnModelCreating:
modelBuilder.Entity<UserRole>(entity =>
{
    entity.HasKey(ur => new { ur.UserId, ur.RoleId });

    entity.HasOne(ur => ur.User)
        .WithMany()  // sẽ thêm navigation property sau
        .HasForeignKey(ur => ur.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(ur => ur.Role)
        .WithMany()
        .HasForeignKey(ur => ur.RoleId)
        .OnDelete(DeleteBehavior.Cascade);
});
```

**Tạo migration:**
```bash
cd apps/backend
dotnet ef migrations add AddUserRolesJunction
dotnet ef database update
```

**Acceptance test:**
- [ ] Bảng `UserRoles` tồn tại với composite PK `(UserId, RoleId)`- [ ] Migration chạy clean, không lỗi FK---### Task 1.4.2: [BE] Refactor seed data → 5 roles: PM, TK, GV, HD, BGH
**File sửa:** `Data/AppDbContext.cs`: phần `OnModelCreating`

```csharp
// XÓA seed cũ:
// new Roles { Id = 1, TenVaiTro = "ADMIN" },
// new Roles { Id = 2, TenVaiTro = "MANAGER" },
// new Roles { Id = 3, TenVaiTro = "COMPILER" }

// THAY bằng 5 roles theo BA:
modelBuilder.Entity<Roles>().HasData(
    new Roles { Id = 1, TenVaiTro = "PM" },   // Cán bộ Quản lý chung
    new Roles { Id = 2, TenVaiTro = "TK" },   // Trưởng khoa
    new Roles { Id = 3, TenVaiTro = "GV" },   // Giảng viên
    new Roles { Id = 4, TenVaiTro = "HD" },   // Hội đồng thẩm định
    new Roles { Id = 5, TenVaiTro = "BGH" }   // Ban Giám hiệu
);

// Seed root PM account + UserRole
modelBuilder.Entity<Accounts>().HasData(
    new Accounts
    {
        Id = 1,
        TenDangNhap = "admin",
        MatKhau = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
        Email = "admin@system.com",
        HoTenNguoiDung = "Root PM",
        TrangThai = "Hoạt động",
        VaiTroId = 1,         // Tạm giữ FK cũ để không break
        TenantId = "HCMCOU"
    }
);

modelBuilder.Entity<UserRole>().HasData(
    new UserRole { UserId = 1, RoleId = 1 }  // admin → PM
);
```

> [!WARNING]
> **Idempotent:** Seed data dùng `HasData()` chỉ chạy khi record chưa tồn tại (EF tự check theo PK).

**Acceptance test:**
- [ ] `SELECT * FROM "Roles"` → 5 records: PM, TK, GV, HD, BGH
- [ ] `SELECT * FROM "UserRoles"` → admin có role PM
- [ ] Seeding chạy lại không tạo duplicate

---

### Task 1.4.3: [BE] Refactor `[Authorize]` → dựa trên chính sách
**File tạo mới:** `Extensions/AuthorizationExtensions.cs`

```csharp
// Extensions/AuthorizationExtensions.cs
using Microsoft.AspNetCore.Authorization;

namespace StartupBackend.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddRbacPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Single-role policies
            options.AddPolicy("PM", policy => policy.RequireRole("PM"));
            options.AddPolicy("TK", policy => policy.RequireRole("TK"));
            options.AddPolicy("GV", policy => policy.RequireRole("GV"));
            options.AddPolicy("HD", policy => policy.RequireRole("HD"));
            options.AddPolicy("BGH", policy => policy.RequireRole("BGH"));

            // Multi-role policies (theo BA RBAC matrix)
            options.AddPolicy("CanManageAccounts",
                policy => policy.RequireRole("PM"));

            options.AddPolicy("CanCreateProgram",
                policy => policy.RequireRole("TK"));

            options.AddPolicy("CanViewSyllabus",
                policy => policy.RequireRole("PM", "TK", "GV", "HD", "BGH"));

            options.AddPolicy("CanEditSyllabus",
                policy => policy.RequireRole("GV"));

            options.AddPolicy("CanApproveDept",
                policy => policy.RequireRole("TK"));

            options.AddPolicy("CanApproveCouncil",
                policy => policy.RequireRole("HD"));

            options.AddPolicy("CanApproveFinal",
                policy => policy.RequireRole("BGH"));

            options.AddPolicy("CanDelegate",
                policy => policy.RequireRole("TK"));
        });

        return services;
    }
}
```

**Đăng ký trong `Program.cs`:**
```csharp
using StartupBackend.Extensions;

// Sau AddAuthentication()
builder.Services.AddRbacPolicies();
```

**Sử dụng trong Controller:**
```csharp
// CŨ:
[Authorize(Roles = "ADMIN")]

// MỚI:
[Authorize(Policy = "CanManageAccounts")]
```

**JWT Claims cần update (trong AuthService):**
```csharp
// Khi user có nhiều roles, thêm nhiều Role claims
var roles = await _context.UserRoles
    .Where(ur => ur.UserId == user.Id)
    .Include(ur => ur.Role)
    .Select(ur => ur.Role.TenVaiTro)
    .ToListAsync();

var claims = new List<Claim>
{
    new(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new(ClaimTypes.Name, user.TenDangNhap),
};

// Thêm mỗi role như 1 claim riêng
foreach (var role in roles)
{
    claims.Add(new Claim(ClaimTypes.Role, role));
}
```

**Acceptance test:**
- [ ] `[Authorize(Policy = "TK")]` chỉ cho phép user có role TK
- [ ] User có nhiều roles → tất cả policies tương ứng đều pass
- [ ] User không có role phù hợp → 403 Forbidden

---

### Task 1.4.4: [BE] Migration script cho data cũ
**File tạo mới:** Migration script: chạy SAU khi có bảng `UserRoles`

```sql
-- Migration: Map roles cũ sang roles mới
-- ADMIN (id=1) → PM (id=1)     ← ID trùng, không cần đổi
-- MANAGER (id=2) → TK (id=2)   ← ID trùng, chỉ đổi tên
-- COMPILER (id=3) → GV (id=3)  ← ID trùng, chỉ đổi tên

-- Step 1: Cập nhật tên role
UPDATE "Roles" SET "TenVaiTro" = 'PM'  WHERE "Id" = 1;
UPDATE "Roles" SET "TenVaiTro" = 'TK'  WHERE "Id" = 2;
UPDATE "Roles" SET "TenVaiTro" = 'GV'  WHERE "Id" = 3;

-- Step 2: Thêm 2 roles mới
INSERT INTO "Roles" ("Id", "TenVaiTro") VALUES (4, 'HD') ON CONFLICT DO NOTHING;
INSERT INTO "Roles" ("Id", "TenVaiTro") VALUES (5, 'BGH') ON CONFLICT DO NOTHING;

-- Step 3: Populate UserRoles từ FK cũ
INSERT INTO "UserRoles" ("UserId", "RoleId", "AssignedAt")
SELECT "Id", "VaiTroId", NOW()
FROM "TaiKhoans"
WHERE "VaiTroId" IS NOT NULL
ON CONFLICT DO NOTHING;
```

> [!CAUTION]
> **BACKUP DB** trước khi chạy migration. Chạy trên staging trước.

**Acceptance test:**
- [ ] Dữ liệu cũ không mất: mọi user cũ đều có entry trong `UserRoles`
- [ ] ADMIN users → role PM, MANAGER → TK, COMPILER → GV

---

### Task 1.4.5: [FE] Cập nhật role constants + route guards
**File tạo mới:** `src/constants/roles.ts`

```typescript
// constants/roles.ts
export enum Role {
  PM = 'PM',
  TK = 'TK',
  GV = 'GV',
  HD = 'HD',
  BGH = 'BGH',
}

// Map role → display name (tiếng Việt)
export const ROLE_LABELS: Record<Role, string> = {
  [Role.PM]: 'Quản lý chung',
  [Role.TK]: 'Trưởng khoa',
  [Role.GV]: 'Giảng viên',
  [Role.HD]: 'Hội đồng thẩm định',
  [Role.BGH]: 'Ban Giám hiệu',
};
```

**File sửa:** `App.jsx`: cập nhật `resolveRole`:

```typescript
// XÓA:
// if (roleStr === 'ADMIN' || roleId === 1) return 'ADMIN';
// if (roleStr === 'MANAGER' || roleId === 2) return 'MANAGER';
// if (roleStr === 'COMPILER' || roleId === 3) return 'COMPILER';

// THAY (sau khi migrate sang Router, dùng trong authStore):
const resolveRoles = (data: AuthResponse): Role[] => {
  return data.user?.roles ?? [Role.GV]; // fallback GV
};
```

**Acceptance test:**
- [ ] FE nhận diện đúng 5 roles
- [ ] Role display name hiển thị tiếng Việt
- [ ] Route guards block user không có quyền

---

## Story 1.5: Frontend Foundation 🔴
**Mục tiêu:** Fix bugs FE, cài routing + UI library + state management
**Dependencies:** Story 1.4 (role constants)
**Branch:** `feature/CARD-XX-fe-foundation`

---

### Task 1.5.1: [FE] Fix 2 API URLs → thống nhất `VITE_API_URL`

> 🟡 **30 phút: Quick Win**

**Vấn đề hiện tại:**
- `api.js` → hardcoded URL `...bf19.up.railway.app`
- `axiosInstance.js` → hardcoded URL `...bf19.up.railway.app`
- `LoginPage.jsx` → có thể dùng URL khác `...d78d`

**Fix:**
1. Xóa file `api.js` hoàn toàn
2. Mọi API call đều dùng `axiosInstance` (đã có `VITE_API_URL`)
3. Sửa `LoginPage.jsx`: thay `fetch()` bằng `axiosInstance`

```typescript
// XÓA trong LoginPage.jsx:
// const res = await fetch('https://...d78d.../api/auth/login', {...})

// THAY:
import axiosInstance from '../services/axiosInstance';
const res = await axiosInstance.post('/api/auth/login', { username, password });
```

**Acceptance test:**
- [ ] Chỉ còn 1 URL duy nhất từ `.env` (`VITE_API_URL`)
- [ ] File `api.js` đã bị xóa
- [ ] Login hoạt động bình thường

---

### Task 1.5.2: [FE] Xóa `api.js`, merge logic vào `axiosInstance`
> Đã thực hiện ở Task 1.5.1. Verify `api.js` không còn import ở bất kỳ đâu.

```bash
# Kiểm tra không còn import nào
grep -r "from.*api" src/ --include="*.jsx" --include="*.tsx" --include="*.ts"
```

---

### Task 1.5.3: [FE] Cài `react-router-dom` + migrate routing

**Cài dependencies:**
```bash
cd apps/frontend
npm install react-router-dom
```

**File tạo mới:** `src/app/Router.tsx`

```tsx
// app/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { Role } from '../constants/roles';

// Pages (tạm dùng file cũ, rename dần)
import LoginPage from '../LoginPage';
import AdminPage from '../Adminpage';
import ManagerPage from '../ManagerPage';

// Route guard component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user) {
    const hasRole = user.roles.some((r) => allowedRoles.includes(r as Role));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected: PM only */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[Role.PM]}>
          <AdminPage />
        </ProtectedRoute>
      } />

      {/* Protected: TK, GV */}
      <Route path="/syllabus/*" element={
        <ProtectedRoute allowedRoles={[Role.TK, Role.GV]}>
          <ManagerPage />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div>404: Trang không tồn tại</div>} />
    </Routes>
  </BrowserRouter>
);
```

**File sửa:** `src/main.jsx` → `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './app/Router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
```

**Acceptance test:**
- [ ] dựa trên URL navigation hoạt động (`/login`, `/admin`, `/syllabus`)
- [ ] Browser back button hoạt động
- [ ] Bookmark URL hoạt động
- [ ] Unauthorized route → redirect về login

---

### Task 1.5.4: [FE] Cài `antd` + migrate `LoginPage` làm mẫu
**Cài dependencies:**
```bash
npm install antd @ant-design/icons
```

**File tạo mới:** `src/styles/theme.ts` (Ant Design theme override)

```typescript
// styles/theme.ts
import type { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#005AE0',
    borderRadius: 8,
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  components: {
    Button: { controlHeight: 40 },
    Input: { controlHeight: 40 },
  },
};
```

**Wrap app với ConfigProvider:**
```tsx
// main.tsx
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { appTheme } from './styles/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={appTheme} locale={viVN}>
      <AppRouter />
    </ConfigProvider>
  </React.StrictMode>
);
```

**Migrate LoginPage: thay inline CSS bằng Ant components:**
```tsx
// Ví dụ chuyển đổi (pattern, không phải full code)
// CŨ: <input style={{...}} value={...} onChange={...} />
// MỚI:
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

<Form onFinish={handleLogin} layout="vertical">
  <Form.Item name="username" rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}>
    <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
  </Form.Item>
  <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
  </Form.Item>
  <Button type="primary" htmlType="submit" block loading={loading}>
    Đăng nhập
  </Button>
</Form>
```

**Acceptance test:**
- [ ] Login page dùng Ant Design components
- [ ] Theme colors khớp design system (`#005AE0`)
- [ ] Locale hiển thị tiếng Việt

---

### Task 1.5.5: [FE] Cài `zustand` + tạo `authStore`
**Cài dependencies:**
```bash
npm install zustand
```

> Code đã mô tả chi tiết trong [Code Standards §4.4](./convention/00-code-standards.md#44-frontend--zustand-store-pattern).
> Tạo file `src/features/auth/store/authStore.ts` theo pattern đó.

**Acceptance test:**
- [ ] Login state persist across page refresh (via `persist` middleware)
- [ ] `useAuthStore()` hook dùng được trong mọi component
- [ ] Logout clear toàn bộ state

---

### Task 1.5.6 đến 1.5.7: [FE] Cleanup + Fix title
**Task 1.5.6:** Xóa dead code
```bash
rm src/components/Navbar.jsx
rm src/components/Toast.jsx
```
Verify không còn import nào referencing 2 file này.

**Task 1.5.7:** Fix `index.html` title
```html
<!-- CŨ: -->
<title>Vite + React</title>

<!-- MỚI: -->
<title>TPMS-AI: Hệ thống Quản lý Chương trình Đào tạo</title>
<meta name="description" content="Hệ thống quản lý chương trình đào tạo tích hợp AI" />
```

**Acceptance test:**
- [ ] Browser tab hiển thị "TPMS AI: Hệ thống Quản lý Chương trình Đào tạo"
- [ ] Không còn unused components

---

## 🟢 Sprint 0 Checklist: Definition of Done
| Story | Deliverable | Verify |
|-------|------------|--------|
| 1.1 | Secrets ngoài source code | `grep -r "password" src/` = 0 |
| 1.2 | JWT validate + refresh + CORS strict | Unit test pass |
| 1.3 | Global error handler + health check | `GET /api/health` → 200 |
| 1.4 | 5 roles, M2M, policy based auth | Seed 5 roles, DB clean |
| 1.5 | Router + Ant Design + Zustand + cleanup | URL nav works, Ant UI |

> [!TIP]
> **Vertical slice kiểm tra:** PM đăng nhập → thấy Admin page → tạo tài khoản GV → GV đăng nhập → thấy Manager page. Flow này chạy E2E = Sprint 0 thành công.

