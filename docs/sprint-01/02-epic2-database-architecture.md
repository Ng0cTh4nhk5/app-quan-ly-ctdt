# EPIC 2: Database & Architecture: Implementation Guide

**Sprint 1: Tuần 3 đến Tuần 4** | **Priority: P1**
**Tham chiếu:** [Task Breakdown](../audit-reports/task_breakdown.md) · [Data Models ERD](../ba/02_design/data_architecture/data_models_erd.md) · [Code Standards](../convention/00-code-standards.md)

> [!IMPORTANT]
> Sprint 1 tập trung vào: Schema chuẩn → Repository pattern → FE TypeScript migration.
> Kết thúc sprint: có thể CRUD account qua UI với full layered architecture.

---

## Story 2.1: Database Schema Alignment 

**Mục tiêu:** DB schema khớp BA ERD, thêm bảng còn thiếu, Polyglot Persistence
**Dependencies:** EPIC 1 hoàn thành (RBAC 5 vai trò, Error Handling)
**Branch:** `feature/CARD-XX-schema-alignment`

### Hiện trạng (Vấn đề)

```
BA yêu cầu:   12+ bảng (Programs, Syllabi, PLO, CLO, Matrix, Approval...)
Code hiện có:  3 bảng (TaiKhoans, VaiTro, RefreshTokens)
Thiếu:         ~9 bảng core business
```

---

### Task 2.1.1: [BE] Tạo core EF models: Batch A (Organization)

**File tạo mới:**

#### `Models/Faculty.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Khoa / Bộ môn</summary>
public class Faculty
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;         // "Công nghệ thông tin"

    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;         // "CNTT"

    public int? DeanId { get; set; }                          // FK → Accounts (Trưởng khoa)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("DeanId")]
    public Accounts? Dean { get; set; }
    public ICollection<Program> Programs { get; set; } = new List<Program>();
}
```

#### `Models/Program.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Chương trình đào tạo (CTĐT)</summary>
public class Program
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Name { get; set; } = string.Empty;         // "Kỹ sư CNTT"

    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;         // "7480201"

    [MaxLength(20)]
    public string Degree { get; set; } = "CuNhan";           // CuNhan | ThacSi | TienSi

    public int TotalCredits { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Draft";            // Draft | Active | Archived

    public int FacultyId { get; set; }
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey("FacultyId")]
    public Faculty Faculty { get; set; } = null!;

    [ForeignKey("CreatedById")]
    public Accounts CreatedBy { get; set; } = null!;

    public ICollection<Syllabus> Syllabi { get; set; } = new List<Syllabus>();
    public ICollection<ProgramLearningOutcome> PLOs { get; set; } = new List<ProgramLearningOutcome>();
}
```

**Acceptance test:**
- [ ] `dotnet ef migrations add AddOrganizationTables`: no errors
- [ ] Bảng `Faculties` + `Programs` tồn tại trong DB

---

### Task 2.1.2: [BE] Tạo core EF models: Batch B (Syllabus + PLO/CLO)
#### `Models/Syllabus.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Đề cương môn học</summary>
public class Syllabus
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string SubjectName { get; set; } = string.Empty;   // "Lập trình hướng đối tượng"

    [MaxLength(20)]
    public string SubjectCode { get; set; } = string.Empty;   // "CS201"

    public int Credits { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "Draft";
    // Draft | PendingDeptApproval | DeptApproved | PendingCouncilReview
    // | CouncilApproved | PendingBGH | Approved | Rejected

    [MaxLength(50)]
    public string Version { get; set; } = "1.0";

    public int ProgramId { get; set; }
    public int AuthorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }

    // Navigation
    [ForeignKey("ProgramId")]
    public Program Program { get; set; } = null!;

    [ForeignKey("AuthorId")]
    public Accounts Author { get; set; } = null!;

    public ICollection<CourseLearningOutcome> CLOs { get; set; } = new List<CourseLearningOutcome>();
    public ICollection<ApprovalStep> ApprovalSteps { get; set; } = new List<ApprovalStep>();
}
```

#### `Models/ProgramLearningOutcome.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Chuẩn đầu ra chương trình (PLO)</summary>
public class ProgramLearningOutcome
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;       // "PLO1", "PLO2"

    [Required, MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string BloomLevel { get; set; } = string.Empty;  // "Apply", "Analyze"

    public int ProgramId { get; set; }

    [ForeignKey("ProgramId")]
    public Program Program { get; set; } = null!;

    public ICollection<PloCloCMapping> PloCloCMappings { get; set; } = new List<PloCloCMapping>();
}
```

#### `Models/CourseLearningOutcome.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Chuẩn đầu ra môn học (CLO)</summary>
public class CourseLearningOutcome
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;       // "CLO1", "CLO2"

    [Required, MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string BloomLevel { get; set; } = string.Empty;

    public int SyllabusId { get; set; }

    [ForeignKey("SyllabusId")]
    public Syllabus Syllabus { get; set; } = null!;

    public ICollection<PloCloCMapping> PloCloCMappings { get; set; } = new List<PloCloCMapping>();
}
```

#### `Models/PloCloCMapping.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Ma trận PLO ↔ CLO</summary>
public class PloCloCMapping
{
    public int PloId { get; set; }
    public int CloId { get; set; }

    [MaxLength(20)]
    public string MappingLevel { get; set; } = "Medium";  // Low | Medium | High

    // Navigation
    [ForeignKey("PloId")]
    public ProgramLearningOutcome PLO { get; set; } = null!;

    [ForeignKey("CloId")]
    public CourseLearningOutcome CLO { get; set; } = null!;
}
```

**Thêm vào `AppDbContext.cs`:**
```csharp
public DbSet<Faculty> Faculties { get; set; }
public DbSet<Program> Programs { get; set; }
public DbSet<Syllabus> Syllabi { get; set; }
public DbSet<ProgramLearningOutcome> PLOs { get; set; }
public DbSet<CourseLearningOutcome> CLOs { get; set; }
public DbSet<PloCloCMapping> PloCloMappings { get; set; }
```

**Fluent API cho composite key:**
```csharp
modelBuilder.Entity<PloCloCMapping>(entity =>
{
    entity.HasKey(m => new { m.PloId, m.CloId });

    entity.HasOne(m => m.PLO)
        .WithMany(p => p.PloCloCMappings)
        .HasForeignKey(m => m.PloId);

    entity.HasOne(m => m.CLO)
        .WithMany(c => c.PloCloCMappings)
        .HasForeignKey(m => m.CloId);
});
```

**Acceptance test:**
- [ ] Migration `AddSyllabusAndOutcomes` thành công
- [ ] Tất cả FK relationships đúng
- [ ] PLO ↔ CLO mapping table có composite PK

---

### Task 2.1.3: [BE] Tạo EF models: Batch C (Approval Workflow)
#### `Models/ApprovalStep.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Bước phê duyệt đề cương</summary>
public class ApprovalStep
{
    [Key]
    public int Id { get; set; }

    public int SyllabusId { get; set; }

    [Required, MaxLength(30)]
    public string StepType { get; set; } = string.Empty;
    // DeptApproval | CouncilReview | BGHApproval

    [MaxLength(20)]
    public string Decision { get; set; } = "Pending";
    // Pending | Approved | Rejected | Delegated

    public int? ReviewerId { get; set; }              // Ai review
    public int? DelegatedById { get; set; }           // TK ủy quyền cho ai?

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DecidedAt { get; set; }

    // Navigation
    [ForeignKey("SyllabusId")]
    public Syllabus Syllabus { get; set; } = null!;

    [ForeignKey("ReviewerId")]
    public Accounts? Reviewer { get; set; }
}
```

#### `Models/AuditLog.cs`
```csharp
namespace StartupBackend.Models;

/// <summary>Nhật ký thao tác hệ thống</summary>
public class AuditLog
{
    [Key]
    public long Id { get; set; }

    public int UserId { get; set; }

    [Required, MaxLength(50)]
    public string Action { get; set; } = string.Empty;    // "CREATE_SYLLABUS", "APPROVE_DEPT"

    [MaxLength(100)]
    public string EntityType { get; set; } = string.Empty; // "Syllabus", "Program"

    public int? EntityId { get; set; }

    [MaxLength(2000)]
    public string? Details { get; set; }                   // JSON string

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public Accounts User { get; set; } = null!;
}
```

**Thêm vào `AppDbContext.cs`:**
```csharp
public DbSet<ApprovalStep> ApprovalSteps { get; set; }
public DbSet<AuditLog> AuditLogs { get; set; }
```

**Acceptance test:**
- [ ] Migration `AddApprovalAndAudit` thành công
- [ ] `ApprovalStep.StepType` có constraint check tại service layer
- [ ] `AuditLog.Id` dùng `long` (bigint) cho volume cao

---

### Task 2.1.4: [BE] Seed data cho Faculty + Program mẫu
```csharp
// Trong OnModelCreating, sau khi seed roles
modelBuilder.Entity<Faculty>().HasData(
    new Faculty
    {
        Id = 1,
        Name = "Khoa Công nghệ thông tin",
        Code = "CNTT",
        DeanId = null  // sẽ assign sau khi có user TK
    }
);

modelBuilder.Entity<Program>().HasData(
    new Program
    {
        Id = 1,
        Name = "Kỹ sư Công nghệ thông tin",
        Code = "7480201",
        Degree = "CuNhan",
        TotalCredits = 130,
        Status = "Active",
        FacultyId = 1,
        CreatedById = 1
    }
);
```

**Acceptance test:**
- [ ] `SELECT * FROM "Faculties"` → 1 record (CNTT)
- [ ] `SELECT * FROM "Programs"` → 1 record (7480201)
- [ ] FK constraints pass

---

### ERD Visualization (Relationships)
```
Faculties ──1:N──→ Programs ──1:N──→ Syllabi ──1:N──→ CLOs
                        │                  │
                        └──1:N──→ PLOs     └──1:N──→ ApprovalSteps
                                    │
                                    └───M:N───→ PLO_CLO_Mappings ←───M:N───┘
                                                     (PloCloCMapping)

Accounts ──M:N──→ UserRoles ──→ Roles
    │
    └──1:N──→ AuditLogs
    └──1:N──→ RefreshTokens
```

---

## Story 2.2: Repository + Service Pattern 

**Mục tiêu:** Tách business logic ra khỏi Controller, áp dụng Controller → Service → Repository
**Dependencies:** Story 2.1 (models đã tạo)
**Branch:** `feature/CARD-XX-layered-architecture`

---

### Task 2.2.1: [BE] Generic Repository interface + implementation

**File tạo mới:** `Repositories/Interfaces/IRepository.cs`

```csharp
namespace StartupBackend.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    IQueryable<T> Query();  // cho advanced queries
}
```

**File tạo mới:** `Repositories/Implementations/Repository.cs`

```csharp
namespace StartupBackend.Repositories.Implementations;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id)
            ?? throw new NotFoundException($"{typeof(T).Name} #{id} không tìm thấy");
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public IQueryable<T> Query() => _dbSet.AsQueryable();
}
```

**Acceptance test:**
- [ ] `Repository<T>` compile thành công
- [ ] CRUD operations chạy qua generic repository

---

### Task 2.2.2: [BE] AccountService: refactor từ Controller sang Service
**File tạo mới:** `Services/Interfaces/IAccountService.cs`

```csharp
namespace StartupBackend.Services.Interfaces;

public interface IAccountService
{
    Task<PagedResult<AccountDto>> GetAccountsAsync(int page, int pageSize, string? search);
    Task<AccountDto> GetByIdAsync(int id);
    Task<AccountDto> CreateAsync(CreateAccountRequest request, int createdBy);
    Task<AccountDto> UpdateAsync(int id, UpdateAccountRequest request);
    Task DeleteAsync(int id);
    Task AssignRolesAsync(int userId, List<int> roleIds, int assignedBy);
}
```

**File tạo mới:** `Services/Implementations/AccountService.cs`

```csharp
namespace StartupBackend.Services.Implementations;

public class AccountService : IAccountService
{
    private readonly IRepository<Accounts> _accountRepo;
    private readonly AppDbContext _context;  // cho complex queries

    public AccountService(IRepository<Accounts> accountRepo, AppDbContext context)
    {
        _accountRepo = accountRepo;
        _context = context;
    }

    public async Task<PagedResult<AccountDto>> GetAccountsAsync(
        int page, int pageSize, string? search)
    {
        var query = _accountRepo.Query()
            .Include(a => a.VaiTro);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(a =>
                a.TenDangNhap.Contains(search) ||
                a.HoTenNguoiDung.Contains(search));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => MapToDto(a))
            .ToListAsync();

        return new PagedResult<AccountDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<AccountDto> CreateAsync(CreateAccountRequest request, int createdBy)
    {
        // Check duplicate username
        var exists = await _context.TaiKhoans
            .AnyAsync(a => a.TenDangNhap == request.Username);
        if (exists)
            throw new BadRequestException("Tên đăng nhập đã tồn tại");

        var account = new Accounts
        {
            TenDangNhap = request.Username,
            MatKhau = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Email = request.Email,
            HoTenNguoiDung = request.FullName,
            TrangThai = "Hoạt động",
            VaiTroId = request.RoleId,  // tạm giữ FK cũ
        };

        var created = await _accountRepo.AddAsync(account);
        return MapToDto(created);
    }

    // ... MapToDto, Update, Delete implementations
}
```

**File tạo mới:** `DTOs/Responses/PagedResult.cs`

```csharp
namespace StartupBackend.DTOs.Responses;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
```

**Acceptance test:**
- [ ] Controller chỉ gọi `_accountService.Method()`, không truy cập `_context`
- [ ] Pagination hoạt động đúng
- [ ] Search filter hoạt động

---

### Task 2.2.3: [BE] DI Registration: gom vào extension method
**File tạo mới:** `Extensions/ServiceExtensions.cs`

```csharp
namespace StartupBackend.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Business services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IEmailService, EmailService>();
        // Thêm service mới ở đây khi tạo

        return services;
    }
}
```

**Đăng ký trong `Program.cs`:**
```csharp
// ❌ XÓA: builder.Services.AddScoped<IEmailService, EmailService>();
// ❌ XÓA: các DI registration rời rạc

// ✅ THAY:
builder.Services.AddApplicationServices();
```

**Acceptance test:**
- [ ] Tất cả DI gom vào `AddApplicationServices()`
- [ ] `Program.cs` clean, không có DI rời rạc

---

### Task 2.2.4: [BE] Refactor `AccountController` → thin controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    [Authorize(Policy = "CanManageAccounts")]
    public async Task<ActionResult<ApiResponse<PagedResult<AccountDto>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var result = await _accountService.GetAccountsAsync(page, pageSize, search);
        return Ok(ApiResponse<PagedResult<AccountDto>>.Success(result));
    }

    [HttpPost]
    [Authorize(Policy = "CanManageAccounts")]
    public async Task<ActionResult<ApiResponse<AccountDto>>> Create(
        [FromBody] CreateAccountRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _accountService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, 
            ApiResponse<AccountDto>.Success(result, "Tạo tài khoản thành công"));
    }
}
```

**Acceptance test:**
- [ ] Controller không có `_context` injection
- [ ] Mỗi action ≤ 5 dòng logic (delegate to service)
- [ ] Response luôn wrapped trong `ApiResponse<T>`

---

## Story 2.3: Frontend TypeScript Migration 
**Mục tiêu:** Chuyển FE sang TypeScript, tạo type definitions cho API responses
**Dependencies:** Story 1.5 (FE Foundation đã setup)
**Branch:** `feature/CARD-XX-typescript-migration`

---

### Task 2.3.1: [FE] Setup TypeScript config

**Cài dependencies:**
```bash
cd apps/frontend
npm install -D typescript @types/react @types/react-dom
```

**File tạo mới:** `tsconfig.json` (Vite đã tạo sẵn nếu init đúng cách)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Acceptance test:**
- [ ] `npx tsc --noEmit`: no errors (sau khi migrate files)
- [ ] Vite build thành công

---

### Task 2.3.2: [FE] Tạo API type definitions
**File tạo mới:** `src/types/api.types.ts`

```typescript
// types/api.types.ts: Khớp 1:1 với BE ApiResponse<T>

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/** Paginated result */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Auth */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  status: string;
}

/** Account management */
export interface AccountDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  status: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  roleId: number;
}
```

**File tạo mới:** `src/types/domain.types.ts`

```typescript
// types/domain.types.ts: Business domain types

export interface FacultyDto {
  id: number;
  name: string;
  code: string;
  deanName?: string;
  programCount: number;
}

export interface ProgramDto {
  id: number;
  name: string;
  code: string;
  degree: string;
  totalCredits: number;
  status: string;
  facultyName: string;
}

export interface SyllabusDto {
  id: number;
  subjectName: string;
  subjectCode: string;
  credits: number;
  status: SyllabusStatus;
  version: string;
  authorName: string;
  programName: string;
  createdAt: string;
  updatedAt?: string;
}

export type SyllabusStatus =
  | 'Draft'
  | 'PendingDeptApproval'
  | 'DeptApproved'
  | 'PendingCouncilReview'
  | 'CouncilApproved'
  | 'PendingBGH'
  | 'Approved'
  | 'Rejected';
```

**Acceptance test:**
- [ ] Types compile clean
- [ ] `SyllabusStatus` là union type (không phải magic string)

---

### Task 2.3.3: [FE] Tạo typed API service layer
**File tạo mới:** `src/services/accountApi.ts`

```typescript
import axiosInstance from './axiosInstance';
import type { ApiResponse, PagedResult, AccountDto, CreateAccountRequest } from '../types/api.types';

export const accountApi = {
  getAll: async (page = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    const res = await axiosInstance.get<ApiResponse<PagedResult<AccountDto>>>(
      `/api/account?${params}`
    );
    return res.data.data;
  },

  getById: async (id: number) => {
    const res = await axiosInstance.get<ApiResponse<AccountDto>>(`/api/account/${id}`);
    return res.data.data;
  },

  create: async (data: CreateAccountRequest) => {
    const res = await axiosInstance.post<ApiResponse<AccountDto>>('/api/account', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CreateAccountRequest>) => {
    const res = await axiosInstance.put<ApiResponse<AccountDto>>(`/api/account/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number) => {
    await axiosInstance.delete(`/api/account/${id}`);
  },
};
```

> [!TIP]
> **Pattern:** Mỗi entity có 1 file `xxxApi.ts`. Import trong component/store, không gọi axios trực tiếp.

**Acceptance test:**
- [ ] `accountApi.getAll()` trả `PagedResult<AccountDto>` typed
- [ ] IDE autocomplete hoạt động cho response fields

---

### Task 2.3.4: [FE] Migrate files `.jsx` → `.tsx` (từng file một)
**Thứ tự migrate (ít dependency trước):**

| Order | File | Priority |
|-------|------|----------|
| 1 | `constants/roles.ts` | 🟢 đã tạo |
| 2 | `types/*.ts` | 🟢 đã tạo |
| 3 | `services/axiosInstance.ts` | 🟢 đã tạo |
| 4 | `services/accountApi.ts` | 🟢 đã tạo |
| 5 | `features/auth/store/authStore.ts` | 🟢 đã tạo |
| 6 | `LoginPage.jsx` → `.tsx` | rename + fix types |
| 7 | `AdminPage.jsx` → `.tsx` | |
| 8 | `ManagerPage.jsx` → `.tsx` | |
| 9 | `App.jsx` → `app/Router.tsx` | |
| 10 | `main.jsx` → `main.tsx` | |

**Quy tắc khi migrate:**
```typescript
// ❌ Không dùng `any`
const [data, setData] = useState<any>(null);

// ✅ Dùng typed state
const [data, setData] = useState<AccountDto[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Acceptance test:**
- [ ] Không còn file `.jsx` nào
- [ ] `npx tsc --noEmit` pass 100%
- [ ] Không có `any` type (trừ escape hatch có comment giải thích)

---

## 🟢 Sprint 1 Checklist: Definition of Done
| Story | Deliverable | Verify |
|-------|------------|--------|
| 2.1 | Schema alignment: 10+ tables | `dotnet ef migrations list` |
| 2.2 | Controller → Service → Repository | Controller ≤ 5 LOC/action |
| 2.3 | FE fully TypeScript | `tsc --noEmit` = 0 errors |

> [!TIP]
> **Vertical slice kiểm tra:** PM đăng nhập → vào trang Quản lý tài khoản → tạo mới GV → thấy trong danh sách. Flow này chạy E2E với full layered architecture = Sprint 1 thành công.

