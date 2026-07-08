using Microsoft.EntityFrameworkCore;
using StartupBackend.Models;
using static StartupBackend.Models.Roles;

namespace StartupBackend.Data
{
        public class AppDbContext : DbContext
        {
            public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

            // khai báo các bảng
            public DbSet<Roles> VaiTros { get; set; }
            public DbSet<Programs> ChuongTrinhDaoTaos { get; set; }
            public DbSet<Accounts> TaiKhoans { get; set; }
            public DbSet<Subjects> MonHocs { get; set; }
            public DbSet<PhanCongBienSoan> PhanCongBienSoans { get; set; }
            public DbSet<Khoas> Khoas { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                
                modelBuilder.Entity<Accounts>()
                    .HasIndex(t => t.TenDangNhap)
                    .IsUnique();

                modelBuilder.Entity<Accounts>()
                    .HasIndex(t => t.Email)
                    .IsUnique();

            //tạo roles
            modelBuilder.Entity<Roles>().HasData(
                new Roles { Id = 1, TenVaiTro = "ADMIN" },
                new Roles { Id = 2, TenVaiTro = "MANAGER" },
                new Roles { Id = 3, TenVaiTro = "COMPILER" }
            );

            //tạo root admin
            var defaultAdminPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123");

            modelBuilder.Entity<Accounts>().HasData(
                new Accounts
                {
                    Id = 1,
                    TenDangNhap = "admin",
                    MatKhau = defaultAdminPassword,
                    Email = "admin@system.com",
                    HoTenNguoiDung = "Root Admin",
                    TrangThai = "Hoạt động",
                    VaiTroId = 1, 
                    TenantId = "HCMCOU" 
                }
            );
        }
        }
    }

