# TPMS AI: Code Standards & Conventions

**Ngày tạo:** 08/07/2026 | **Vai trò:** Tech Lead
**Áp dụng cho:** Toàn bộ team BE (.NET 10) + FE (React/TypeScript)

> [!IMPORTANT]
> Đây là tài liệu **nền tảng**. Mọi Implementation Guide (Epic 1→4) đều tham chiếu về đây.
> Mọi thành viên **bắt buộc đọc** trước khi commit code đầu tiên.

---

## 1. Project Structure

### 1.1. Backend: Target Folder Structure

```
apps/backend/
├── Controllers/           # Thin controllers: chỉ routing và validation
├── Services/
│   ├── Interfaces/        # ISyllabusService, IAuthService...
│   └── Implementations/   # SyllabusService, AuthService...
├── Repositories/
│   ├── Interfaces/        # IRepository<T>, ISyllabusRepository...
│   └── Implementations/   # Repository<T>, SyllabusRepository...
├── Models/                # EF Core entities
│   └── Enums/             # Role, ApprovalStatus, DelegationStatus...
├── DTOs/
│   ├── Requests/          # CreateSyllabusRequest, LoginRequest...
│   └── Responses/         # SyllabusResponse, ApiResponse<T>...
├── Middleware/             # ExceptionHandler, AuditLogMiddleware...
├── Extensions/            # ServiceCollectionExtensions (DI registration)
├── Data/
│   ├── AppDbContext.cs
│   └── Configurations/    # EF Fluent API configs (UserConfiguration.cs...)
├── Migrations/
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

**So sánh hiện tại → target:**

| Hiện tại | Target | Ghi chú |
|----------|--------|---------|
| `Controllers/AuthController.cs` (fat, 8.8KB) | `Controllers/` + `Services/Implementations/AuthService.cs` | Tách business logic ra service |
| `Models/Accounts.cs` | `Models/User.cs` | Rename sang English, số ít |
| `Models/Khoas.cs` | `Models/Department.cs` | Rename |
| `DTOs/AccountDTOs.cs` | `DTOs/Requests/` + `DTOs/Responses/` | Tách Request/Response |
| *(không có)* | `Repositories/` | Tạo mới |
| *(không có)* | `Middleware/` | Tạo mới |
| *(không có)* | `Extensions/` | Tạo mới |

### 1.2. Frontend: Target Folder Structure

```
apps/frontend/src/
├── app/                   # App-level setup
│   ├── Router.tsx         # React Router config
│   ├── Providers.tsx      # Context providers wrapper
│   └── ErrorBoundary.tsx
├── components/            # Shared/reusable
│   ├── ui/                # Button, Modal, DataTable wrappers
│   └── layout/            # AppLayout, Sidebar, Header
├── features/              # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/    # LoginForm.tsx, ForgotPasswordModal.tsx
│   │   ├── hooks/         # useAuth.ts, useRefreshToken.ts
│   │   ├── services/      # authService.ts
│   │   └── store/         # authStore.ts
│   ├── syllabus/
│   │   ├── components/    # SyllabusCard.tsx, SyllabusEditor.tsx
│   │   ├── hooks/         # useSyllabusList.ts
│   │   ├── services/      # syllabusService.ts
│   │   └── pages/         # SyllabusListPage.tsx, SyllabusEditPage.tsx
│   ├── approval/
│   ├── dashboard/
│   └── admin/
├── hooks/                 # Global hooks (useDebounce, useMediaQuery)
├── services/              # axiosInstance.ts (global API client)
├── stores/                # Global Zustand stores
├── types/                 # Shared TypeScript types & enums
├── utils/                 # Helpers (formatDate, roleGuard)
├── constants/             # API_ROUTES, ROLES, ROUTE_PATHS
└── styles/                # Global CSS, Ant Design theme
```

**Mapping file hiện tại → target:**

| Hiện tại | Target | Ghi chú |
|----------|--------|---------|
| `App.jsx` | `app/Router.tsx` + `app/Providers.tsx` | Tách routing ra file riêng |
| `Adminpage.jsx` (30KB, 544+ dòng) | `features/admin/pages/AccountManagementPage.tsx` | Tách thành nhiều component |
| `ManagerPage.jsx` | `features/syllabus/pages/SyllabusListPage.tsx` | Rename theo domain |
| `LoginPage.jsx` | `features/auth/components/LoginForm.tsx` | Chuyển vào feature module |
| `api.js` | **XÓA**: merge vào `services/axiosInstance.ts` | Loại bỏ duplicate |
| `components/Navbar.jsx` | **XÓA**: dùng Ant Layout | Dead code |
| `components/Toast.jsx` | **XÓA**: dùng Ant notification | Dead code |
| `services/axiosInstance.js` | `services/axiosInstance.ts` | Chuyển sang TypeScript |
| `pages/ChuongTrinhDaoTao/` | `features/program/pages/` | Rename sang English |
| `pages/MonHoc/` | `features/subject/pages/` | Rename |
| `pages/ThanhVien/` | `features/admin/pages/` | Rename |

---

## 2. Naming Conventions: Backend (.NET 10 / C#)

### 2.1. Tổng quan

| Loại | Convention | Ví dụ đúng 🟢 | Anti pattern 🔴 (hiện tại) |
|------|-----------|--------------|--------------------------|
| **Class / Entity** | PascalCase, số ít, English | `User`, `Syllabus`, `Department` | `Accounts`, `Khoas` |
| **Interface** | Prefix `I` + PascalCase | `ISyllabusService` | *(chưa có service)* |
| **Property** | PascalCase, English | `Username`, `FullName`, `Status` | `TenDangNhap`, `HoTenNguoiDung` |
| **Method** | PascalCase + `Async` suffix | `GetByIdAsync()`, `CreateAsync()` |: |
| **Private field** | `_camelCase` | `_syllabusRepository` |: |
| **Parameter** | camelCase | `createRequest`, `userId` |: |
| **DTO class** | PascalCase + suffix rõ ràng | `CreateSyllabusRequest`, `SyllabusResponse` | `SubjectCreateDTOs` |
| **Enum** | PascalCase, tên số ít | `ApprovalStatus`, `Role` |: |
| **Enum values** | PascalCase | `ApprovalStatus.DeptApproved` |: |
| **Constant** | PascalCase | `DefaultRole`, `MaxPageSize` |: |
| **DbSet** | PascalCase, số nhiều, English | `Users`, `Syllabi`, `Departments` | `TaiKhoans`, `VaiTros` |
| **Namespace** | `StartupBackend.{Layer}` | `StartupBackend.Services` |: |

### 2.2. Entity Naming: Lộ trình chuyển đổi

> [!WARNING]
> Hiện tại toàn bộ entity dùng tên Vietnamese. Chuyển sang English **dần dần** theo sprint.

**Sprint 0:** Giữ nguyên models cũ, chỉ thêm models mới bằng English
**Sprint 1+:** Rename khi refactor từng module (kèm migration script)

**Bảng mapping tên entity:**

| Hiện tại (Vietnamese) | Target (English) | DbSet |
|----------------------|-------------------|-------|
| `Accounts` | `User` | `Users` |
| `Roles` | `Role` | `Roles` |
| `Programs` | `TrainingProgram` | `TrainingPrograms` |
| `Subjects` | `Course` | `Courses` |
| `Khoas` | `Department` | `Departments` |
| `PhanCongBienSoan` | `SyllabusAssignment` | `SyllabusAssignments` |
| *(mới)* | `Syllabus` | `Syllabi` |
| *(mới)* | `SyllabusVersion` | `SyllabusVersions` |
| *(mới)* | `Plo` | `Plos` |
| *(mới)* | `Clo` | `Clos` |
| *(mới)* | `PloCloMap` | `PloCloMaps` |
| *(mới)* | `ApprovalTask` | `ApprovalTasks` |
| *(mới)* | `ApprovalLog` | `ApprovalLogs` |
| *(mới)* | `Delegation` | `Delegations` |
| *(mới)* | `AuditLog` | `AuditLogs` |
| *(mới)* | `Notification` | `Notifications` |

**Bảng mapping property (cho model `User`):**

| Hiện tại | Target | Type |
|----------|--------|------|
| `TenDangNhap` | `Username` | `string` |
| `MatKhau` | `PasswordHash` | `string` |
| `HoTenNguoiDung` | `FullName` | `string` |
| `TrangThai` | `Status` | `UserStatus` (enum) |
| `VaiTroId` | *(xóa: chuyển sang M2M)* |: |
| `MaCTDT` | `TrainingProgramId` | `string?` |
| `HocHam` | `AcademicRank` | `string?` |
| `HocVi` | `Degree` | `string?` |
| `TrinhDoChuyenMon` | `Specialization` | `string?` |
| `MaKhoa` | `DepartmentCode` | `string?` |

### 2.3. Controller & Route Naming

```csharp
// Route = lowercase, plural, English
[Route("api/syllabi")]          // không phải "api/Syllabus" hay "api/de-cuong"
[Route("api/users")]            // không phải "api/Accounts"
[Route("api/training-programs")]// kebab-case cho multi-word

// Action methods = HTTP verb rõ ràng
[HttpGet]                       // GET /api/syllabi
[HttpGet("{id}")]              // GET /api/syllabi/5
[HttpPost]                     // POST /api/syllabi
[HttpPut("{id}")]              // PUT /api/syllabi/5
[HttpDelete("{id}")]           // DELETE /api/syllabi/5

// Custom actions dùng route rõ ràng
[HttpPost("{id}/submit")]      // POST /api/syllabi/5/submit
[HttpPost("{id}/approve")]     // POST /api/syllabi/5/approve
```

---

## 3. Naming Conventions: Frontend (React + TypeScript)

### 3.1. Tổng quan

| Loại | Convention | Ví dụ đúng 🟢 | Anti pattern 🔴 |
|------|-----------|--------------|----------------|
| **Component file** | PascalCase `.tsx` | `SyllabusListPage.tsx` | `Adminpage.jsx` |
| **Component name** | PascalCase | `SyllabusCard` | `Adminquanlytaikhoan` |
| **Hook file** | camelCase, prefix `use` | `useAuth.ts` |: |
| **Service file** | camelCase + `Service` | `syllabusService.ts` | `programService.js` |
| **Store file** | camelCase + `Store` | `authStore.ts` |: |
| **Type / Interface** | PascalCase | `SyllabusResponse` |: |
| **Enum** | PascalCase | `Role`, `ApprovalStatus` |: |
| **Constant** | UPPER_SNAKE_CASE | `API_ROUTES`, `MAX_PAGE_SIZE` |: |
| **Util file** | camelCase | `formatDate.ts` |: |
| **CSS Module** | camelCase `.module.css` | `syllabusCard.module.css` | inline CSS |
| **Folder (feature)** | kebab case | `features/syllabus/` | `ChuongTrinhDaoTao/` |
| **Test file** | `*.test.tsx` / `*.spec.tsx` | `LoginForm.test.tsx` |: |

### 3.2. Component File Naming: Suffix Convention

| Suffix | Dùng cho | Ví dụ |
|--------|---------|-------|
| `*Page.tsx` | Route level component (full page) | `SyllabusListPage.tsx` |
| `*Form.tsx` | Form component | `LoginForm.tsx`, `SyllabusForm.tsx` |
| `*Modal.tsx` | Modal/Dialog | `ConfirmApprovalModal.tsx` |
| `*Card.tsx` | Card display | `SyllabusCard.tsx` |
| `*Table.tsx` | Table wrapper | `UserTable.tsx` |
| `*Badge.tsx` | Status badge | `ApprovalStatusBadge.tsx` |
| `*Layout.tsx` | Layout wrapper | `AppLayout.tsx` |
| *(không suffix)* | General component | `Sidebar.tsx`, `Header.tsx` |

### 3.3. TypeScript Types: Naming Pattern

```typescript
// API Response types: suffix "Response"
interface SyllabusResponse {
  id: number;
  name: string;
  status: ApprovalStatus;
}

// API Request types: suffix "Request"
interface CreateSyllabusRequest {
  courseId: number;
  content: string;
}

// Enums: PascalCase, string values
enum Role {
  PM = 'PM',
  TK = 'TK',
  GV = 'GV',
  HD = 'HD',
  BGH = 'BGH',
}

enum ApprovalStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED',
  DeptApproved = 'DEPT_APPROVED',
  CouncilReviewed = 'COUNCIL_REVIEWED',
  Final = 'FINAL',
}

// Props: suffix "Props"
interface SyllabusCardProps {
  syllabus: SyllabusResponse;
  onEdit: (id: number) => void;
}

// Store state: suffix "State"
interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Constants: UPPER_SNAKE_CASE, as const
const API_ROUTES = {
  AUTH: '/api/auth',
  SYLLABI: '/api/syllabi',
  USERS: '/api/users',
} as const;
```

---

## 4. Code Patterns

### 4.1. Backend: Thin Controller Pattern

```csharp
// ĐÚNG: Controller chỉ routing và validation
[ApiController]
[Route("api/syllabi")]
public class SyllabusController : ControllerBase
{
    private readonly ISyllabusService _service;

    public SyllabusController(ISyllabusService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "CanViewSyllabus")]
    public async Task<ActionResult<ApiResponse<SyllabusResponse>>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<SyllabusResponse>.Success(result));
    }

    [HttpPost]
    [Authorize(Policy = "CanCreateSyllabus")]
    public async Task<ActionResult<ApiResponse<SyllabusResponse>>> Create(
        [FromBody] CreateSyllabusRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, 
            ApiResponse<SyllabusResponse>.Success(result));
    }
}
```

### 4.2. Backend: ApiResponse<T> Standard

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public string? TraceId { get; set; }

    public static ApiResponse<T> Ok(T data, string msg = "Success")
        => new() { Success = true, StatusCode = 200, Data = data, Message = msg };

    public static ApiResponse<T> Created(T data, string msg = "Created")
        => new() { Success = true, StatusCode = 201, Data = data, Message = msg };

    public static ApiResponse<T> Error(int code, string msg)
        => new() { Success = false, StatusCode = code, Message = msg };
}
```

### 4.3. Frontend: Component Pattern

```tsx
// ĐÚNG: Typed props, single responsibility, dưới 250 dòng
interface SyllabusCardProps {
  syllabus: SyllabusResponse;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SyllabusCard: React.FC<SyllabusCardProps> = ({
  syllabus,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      title={syllabus.name}
      extra={<ApprovalStatusBadge status={syllabus.status} />}
      actions={[
        <Button key="edit" onClick={() => onEdit(syllabus.id)}>Sửa</Button>,
        <Popconfirm key="del" title="Xác nhận xóa?" onConfirm={() => onDelete(syllabus.id)}>
          <Button danger>Xóa</Button>
        </Popconfirm>,
      ]}
    >
      <p>{syllabus.courseName}</p>
    </Card>
  );
};
```

### 4.4. Frontend: Zustand Store Pattern

```typescript
// features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (creds: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (creds) => {
        const res = await authService.login(creds);
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        sessionStorage.removeItem('token');
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### 4.5. Frontend: Custom Hook Pattern

```typescript
// features/syllabus/hooks/useSyllabusList.ts
import { useState, useEffect } from 'react';
import { syllabusService } from '../services/syllabusService';

export const useSyllabusList = (page: number, pageSize: number) => {
  const [data, setData] = useState<SyllabusResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await syllabusService.getList(page, pageSize);
        setData(res.data.items);
        setTotal(res.data.total);
      } catch (err) {
        setError('Không thể tải danh sách đề cương');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, pageSize]);

  return { data, total, loading, error };
};
```

---

## 5. API Design Standards

### 5.1. RESTful Naming

| Method | Route | Mô tả |
|--------|-------|--------|
| `GET` | `/api/syllabi` | Lấy danh sách (có pagination) |
| `GET` | `/api/syllabi/{id}` | Lấy chi tiết |
| `POST` | `/api/syllabi` | Tạo mới |
| `PUT` | `/api/syllabi/{id}` | Cập nhật toàn bộ |
| `PATCH` | `/api/syllabi/{id}` | Cập nhật một phần |
| `DELETE` | `/api/syllabi/{id}` | Xóa |
| `POST` | `/api/syllabi/{id}/submit` | Action: nộp duyệt |
| `POST` | `/api/syllabi/{id}/approve` | Action: phê duyệt |

### 5.2. Pagination

```
GET /api/syllabi?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc
```

Response:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

### 5.3. Error Response

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Không tìm thấy đề cương với ID = 99",
  "traceId": "abc-123-def"
}
```

---

## 6. Git Workflow & PR Standards

Quy trình Git được định nghĩa đầy đủ trong tài liệu chuyên biệt: [`01-git-flow.md`](./01-git-flow.md).

Tài liệu đó bao gồm: mô hình nhánh, quy ước đặt tên, commit message, quy trình PR, thiết lập GitHub, tình huống thường gặp, và cheat sheet cho developer.

> [!IMPORTANT]
> Không dùng quy ước branch naming trong file này làm tham chiếu. Nguồn duy nhất về Git là `01-git-flow.md`.

---

## 7. Team Quality Rules

| # | Rule | Lý do | Enforcement |
|---|------|-------|-------------|
| 1 | **Mỗi file ≤ 250 dòng** | Dễ review, dễ maintain | PR review |
| 2 | **Mỗi function ≤ 30 dòng** | Single responsibility | PR review |
| 3 | **Không hardcode** URL, secret, magic number | Security + maintainability | Pre commit hook |
| 4 | **Console.log chỉ ở dev** | Production không leak info | Lint rule |
| 5 | **Mọi API trả `ApiResponse<T>`** | FE xử lý nhất quán | PR review |
| 6 | **Comment = WHY, không phải WHAT** | Code tự giải thích what | PR review |
| 7 | **PR ≤ 400 dòng, 1 reviewer** | Quality gate | GitHub settings |
| 8 | **Vertical slice shipping** | Ship BE+FE+test cùng lúc | Sprint planning |
| 9 | **File mới bắt buộc `.ts/.tsx`** | TypeScript migration | Lint rule |
| 10 | **Không dùng `any` trong TypeScript** | Type safety | `tsconfig strict` |
