using Microsoft.EntityFrameworkCore;
using StartupBackend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using StartupBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<IEmailService , EmailService>();

// khởi tạo cấu hình JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // tạm thời bỏ qua check nguồn phát
            ValidateAudience = false, // tạm thời bỏ qua check người nhận
            ValidateLifetime = true, // CÓ check thời hạn Token
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Mot_chuoi_ki_tu_bi_mat_cuc_ky_dai_va_kho_doan_khoang_32_ki_tu_nhe"))
        };
    });

// cấu hình swagger để hỗ trợ authentication
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Student Management API", Version = "v1" });

    // Định nghĩa nút Authorize
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập 'Bearer [khoảng trắng] {token trả vể}' vào đây. \r\n\r\nVí dụ: Bearer eyJhbGci...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // yêu cấu các API phải có token hợp lệ
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// khởi tạo chuỗi kết nối
var defaultConn = builder.Configuration.GetConnectionString("DefaultConnection");
var envDatabaseUrl = builder.Configuration["DATABASE_URL"];

// nếu có DATABASE_URL thì xài, không thì xài chuỗi mặc định trong appsettings.json
var rawUrl = !string.IsNullOrEmpty(envDatabaseUrl) ? envDatabaseUrl : defaultConn;
string finalConnectionString = "";

if (!string.IsNullOrEmpty(rawUrl) && (rawUrl.StartsWith("postgres://") || rawUrl.StartsWith("postgresql://")))
{
    var databaseUri = new Uri(rawUrl);
    var userInfo = databaseUri.UserInfo.Split(':');

    finalConnectionString = $"Host={databaseUri.Host};Port={databaseUri.Port};Database={databaseUri.LocalPath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};Ssl Mode=Require;Trust Server Certificate=true;";
}
else
{
    finalConnectionString = rawUrl;
}

// kết nối dbcontext 
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(finalConnectionString));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// cấu hình CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // cho phép mọi domain => mai mốt chỉnh lại domain cụ thể của fe sau
              .AllowAnyMethod()   
              .AllowAnyHeader();  
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// tạo data seeding
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // tự động chạy Migration cập nhật DB 
    context.Database.Migrate();

    if (!context.TaiKhoans.Any(t => t.VaiTroId == 1))
    {
        var rootAdmin = new StartupBackend.Models.Accounts 
        {
            TenDangNhap = "admin",
            MatKhau = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            HoTenNguoiDung = "Root Admin",
            Email = "admin@startup.com",
            TenantId = "HCMOU",
            VaiTroId = 1, 
            TrangThai = "Hoạt động", 
            NguoiTaoId = null,
            MaCTDT = null
        };

        context.TaiKhoans.Add(rootAdmin);
        context.SaveChanges();

        Console.WriteLine("Đã khởi tạo ROOT ADMIN!");
    }
}

app.Run();
