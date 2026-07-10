# EPIC 3: Core Business Logic: Implementation Guide

**Sprint 2: Tuần 5 đến Tuần 6** | **Priority: 🟡 P2**
**Tham chiếu:** [Task Breakdown](../audit-reports/task_breakdown.md) · [State Machine](../ba/02_design/functional/state_machine.md) · [Code Standards](./convention/00-code-standards.md)

> [!IMPORTANT]
> Sprint 2 tập trung: Syllabus CRUD → PLO/CLO Management → Approval Workflow.
> Kết thúc sprint: GV tạo đề cương → TK duyệt cấp khoa → HĐ thẩm định → BGH phê duyệt cuối.

---

## Story 3.1: Syllabus CRUD 🟡

**Mục tiêu:** CRUD đề cương môn học với phân quyền đúng BA
**Dependencies:** EPIC 2 (models + repository + typed API)
**Branch:** `feature/CARD-XX-syllabus-crud`

---

### Task 3.1.1: [BE] SyllabusService: CRUD + filtering

**File tạo mới:** `Services/Interfaces/ISyllabusService.cs`

```csharp
namespace StartupBackend.Services.Interfaces;

public interface ISyllabusService
{
    Task<PagedResult<SyllabusDto>> GetAllAsync(SyllabusFilterRequest filter);
    Task<SyllabusDetailDto> GetByIdAsync(int id);
    Task<SyllabusDto> CreateAsync(CreateSyllabusRequest request, int authorId);
    Task<SyllabusDto> UpdateAsync(int id, UpdateSyllabusRequest request, int userId);
    Task DeleteAsync(int id, int userId);
    Task SubmitForApprovalAsync(int id, int userId);
}
```

**File tạo mới:** `DTOs/Requests/SyllabusRequests.cs`

```csharp
namespace StartupBackend.DTOs.Requests;

public class SyllabusFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public int? ProgramId { get; set; }
}

public class CreateSyllabusRequest
{
    [Required, MaxLength(300)]
    public string SubjectName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string SubjectCode { get; set; } = string.Empty;

    [Range(1, 20)]
    public int Credits { get; set; }

    public int ProgramId { get; set; }
}

public class UpdateSyllabusRequest
{
    [MaxLength(300)]
    public string? SubjectName { get; set; }

    [Range(1, 20)]
    public int? Credits { get; set; }
}
```

**File tạo mới:** `Services/Implementations/SyllabusService.cs` (skeleton)

```csharp
namespace StartupBackend.Services.Implementations;

public class SyllabusService : ISyllabusService
{
    private readonly IRepository<Syllabus> _syllabusRepo;
    private readonly AppDbContext _context;

    public SyllabusService(IRepository<Syllabus> syllabusRepo, AppDbContext context)
    {
        _syllabusRepo = syllabusRepo;
        _context = context;
    }

    public async Task<PagedResult<SyllabusDto>> GetAllAsync(SyllabusFilterRequest filter)
    {
        var query = _syllabusRepo.Query()
            .Include(s => s.Author)
            .Include(s => s.Program)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(s =>
                s.SubjectName.Contains(filter.Search) ||
                s.SubjectCode.Contains(filter.Search));

        if (!string.IsNullOrEmpty(filter.Status))
            query = query.Where(s => s.Status == filter.Status);

        if (filter.ProgramId.HasValue)
            query = query.Where(s => s.ProgramId == filter.ProgramId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(s => new SyllabusDto
            {
                Id = s.Id,
                SubjectName = s.SubjectName,
                SubjectCode = s.SubjectCode,
                Credits = s.Credits,
                Status = s.Status,
                Version = s.Version,
                AuthorName = s.Author.HoTenNguoiDung,
                ProgramName = s.Program.Name,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
            })
            .ToListAsync();

        return new PagedResult<SyllabusDto> { Items = items, TotalCount = total, Page = filter.Page, PageSize = filter.PageSize };
    }

    public async Task<SyllabusDto> CreateAsync(CreateSyllabusRequest request, int authorId)
    {
        // Verify program exists
        var program = await _context.Programs.FindAsync(request.ProgramId)
            ?? throw new NotFoundException($"Chương trình #{request.ProgramId} không tồn tại");

        // Check duplicate subject code within program
        var duplicate = await _context.Syllabi
            .AnyAsync(s => s.SubjectCode == request.SubjectCode && s.ProgramId == request.ProgramId);
        if (duplicate)
            throw new BadRequestException($"Mã môn {request.SubjectCode} đã tồn tại trong chương trình này");

        var syllabus = new Syllabus
        {
            SubjectName = request.SubjectName,
            SubjectCode = request.SubjectCode,
            Credits = request.Credits,
            ProgramId = request.ProgramId,
            AuthorId = authorId,
            Status = "Draft",
            Version = "1.0",
        };

        var created = await _syllabusRepo.AddAsync(syllabus);
        return MapToDto(created);
    }

    public async Task SubmitForApprovalAsync(int id, int userId)
    {
        var syllabus = await _syllabusRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Đề cương #{id} không tồn tại");

        if (syllabus.AuthorId != userId)
            throw new ForbiddenException("Chỉ tác giả mới được submit đề cương");

        if (syllabus.Status != "Draft" && syllabus.Status != "Rejected")
            throw new BadRequestException($"Không thể submit đề cương ở trạng thái {syllabus.Status}");

        syllabus.Status = "PendingDeptApproval";
        syllabus.SubmittedAt = DateTime.UtcNow;
        syllabus.UpdatedAt = DateTime.UtcNow;
        await _syllabusRepo.UpdateAsync(syllabus);

        // Tạo approval step đầu tiên
        _context.ApprovalSteps.Add(new ApprovalStep
        {
            SyllabusId = id,
            StepType = "DeptApproval",
            Decision = "Pending",
        });
        await _context.SaveChangesAsync();
    }

    // MapToDto helper...
}
```

**Acceptance test:**
- [ ] `GET /api/syllabus?status=Draft&programId=1` trả filtered results
- [ ] `POST /api/syllabus` → tạo mới với status = Draft
- [ ] `POST /api/syllabus/{id}/submit` → chuyển status = PendingDeptApproval

---

### Task 3.1.2: [BE] SyllabusController: thin controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SyllabusController : ControllerBase
{
    private readonly ISyllabusService _syllabusService;

    public SyllabusController(ISyllabusService syllabusService)
    {
        _syllabusService = syllabusService;
    }

    [HttpGet]
    [Authorize(Policy = "CanViewSyllabus")]
    public async Task<ActionResult<ApiResponse<PagedResult<SyllabusDto>>>> GetAll(
        [FromQuery] SyllabusFilterRequest filter)
    {
        var result = await _syllabusService.GetAllAsync(filter);
        return Ok(ApiResponse<PagedResult<SyllabusDto>>.Success(result));
    }

    [HttpPost]
    [Authorize(Policy = "CanEditSyllabus")]
    public async Task<ActionResult<ApiResponse<SyllabusDto>>> Create(
        [FromBody] CreateSyllabusRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _syllabusService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<SyllabusDto>.Success(result, "Tạo đề cương thành công"));
    }

    [HttpPost("{id}/submit")]
    [Authorize(Policy = "CanEditSyllabus")]
    public async Task<IActionResult> Submit(int id)
    {
        var userId = GetCurrentUserId();
        await _syllabusService.SubmitForApprovalAsync(id, userId);
        return Ok(ApiResponse<object>.Success(null!, "Đã gửi phê duyệt"));
    }

    private int GetCurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
```

---

### Task 3.1.3: [FE] Syllabus list page: Ant Design Table

**File tạo mới:** `src/features/syllabus/pages/SyllabusListPage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Button, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { syllabusApi } from '../../../services/syllabusApi';
import type { SyllabusDto, SyllabusStatus } from '../../../types/domain.types';

const STATUS_COLORS: Record<SyllabusStatus, string> = {
  Draft: 'default',
  PendingDeptApproval: 'processing',
  DeptApproved: 'cyan',
  PendingCouncilReview: 'orange',
  CouncilApproved: 'blue',
  PendingBGH: 'gold',
  Approved: 'success',
  Rejected: 'error',
};

export const SyllabusListPage: React.FC = () => {
  const [data, setData] = useState<SyllabusDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await syllabusApi.getAll(page, 10, search);
      setData(result.items);
      setTotal(result.totalCount);
    } catch {
      message.error('Không thể tải danh sách đề cương');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const columns = [
    { title: 'Mã môn', dataIndex: 'subjectCode', width: 100 },
    { title: 'Tên môn học', dataIndex: 'subjectName' },
    { title: 'Tín chỉ', dataIndex: 'credits', width: 80, align: 'center' as const },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 160,
      render: (status: SyllabusStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    { title: 'Tác giả', dataIndex: 'authorName' },
    { title: 'Cập nhật', dataIndex: 'updatedAt', render: (d: string) => d ? new Date(d).toLocaleDateString('vi') : '—' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} size="middle">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />}>Tạo đề cương</Button>
      </Space>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} đề cương`,
        }}
      />
    </div>
  );
};
```

**Acceptance test:**
- [ ] Table render danh sách đề cương với pagination
- [ ] Status hiển thị Tag color-coded
- [ ] Search filter hoạt động thời gian thực

---

## Story 3.2: PLO/CLO Management + Mapping Matrix 🟡
**Mục tiêu:** CRUD PLO, CLO + kéo thả mapping matrix
**Dependencies:** Story 3.1
**Branch:** `feature/CARD-XX-plo-clo-management`

---

### Task 3.2.1: [BE] PLO/CLO Service

> Theo pattern tương tự `SyllabusService`. Skeleton:

```csharp
public interface IPloService
{
    Task<List<PloDto>> GetByProgramAsync(int programId);
    Task<PloDto> CreateAsync(int programId, CreatePloRequest request);
    Task<PloDto> UpdateAsync(int id, UpdatePloRequest request);
    Task DeleteAsync(int id);
}

public interface ICloService
{
    Task<List<CloDto>> GetBySyllabusAsync(int syllabusId);
    Task<CloDto> CreateAsync(int syllabusId, CreateCloRequest request);
    Task DeleteAsync(int id);
}
```

---

### Task 3.2.2: [BE] PLO CLO Mapping Service

```csharp
public interface IPloCloMappingService
{
    Task<List<PloCloMappingDto>> GetMatrixAsync(int programId, int syllabusId);
    Task UpdateMappingsAsync(int syllabusId, List<UpdateMappingRequest> mappings);
}

// DTO
public class UpdateMappingRequest
{
    public int PloId { get; set; }
    public int CloId { get; set; }
    public string MappingLevel { get; set; } = "Medium"; // Low | Medium | High | null (xóa)
}
```

**Implementation: batch upsert:**
```csharp
public async Task UpdateMappingsAsync(int syllabusId, List<UpdateMappingRequest> mappings)
{
    // Validate CLOs belong to this syllabus
    var cloIds = await _context.CLOs
        .Where(c => c.SyllabusId == syllabusId)
        .Select(c => c.Id)
        .ToListAsync();

    foreach (var m in mappings)
    {
        if (!cloIds.Contains(m.CloId))
            throw new BadRequestException($"CLO #{m.CloId} không thuộc đề cương này");

        var existing = await _context.PloCloMappings
            .FindAsync(m.PloId, m.CloId);

        if (m.MappingLevel == null)
        {
            // Xóa mapping
            if (existing != null) _context.PloCloMappings.Remove(existing);
        }
        else if (existing != null)
        {
            // Update
            existing.MappingLevel = m.MappingLevel;
        }
        else
        {
            // Create
            _context.PloCloMappings.Add(new PloCloCMapping
            {
                PloId = m.PloId,
                CloId = m.CloId,
                MappingLevel = m.MappingLevel
            });
        }
    }

    await _context.SaveChangesAsync();
}
```

**Acceptance test:**
- [ ] `GET /api/syllabus/{id}/matrix` trả grid PLO × CLO
- [ ] `PUT /api/syllabus/{id}/matrix` batch update thành công
- [ ] Mapping level = null → xóa mapping

---

### Task 3.2.3: [FE] PLO CLO Matrix UI (Ant Design)
> Component pattern (không full code: team tự implement):

```tsx
// Pattern: Editable matrix grid
// Dùng Ant Design Table + custom cell renderer
// Row = PLO, Column = CLO
// Cell = Select dropdown (Cao/Trung bình/Thấp/Trống)

<Table
  dataSource={plos}
  columns={[
    { title: 'PLO', dataIndex: 'code', fixed: 'left' },
    ...clos.map(clo => ({
      title: clo.code,
      key: `clo-${clo.id}`,
      render: (_: unknown, plo: PloDto) => (
        <Select
          value={getMapping(plo.id, clo.id)}
          onChange={(val) => handleMappingChange(plo.id, clo.id, val)}
          options={[
            { value: 'High', label: '🔴 Cao' },
            { value: 'Medium', label: '🟡 TB' },
            { value: 'Low', label: '🟢 Thấp' },
            { value: null, label: '—' },
          ]}
        />
      ),
    })),
  ]}
  scroll={{ x: 'max-content' }}
/>
```

**Acceptance test:**
- [ ] Matrix render đúng PLO × CLO
- [ ] Thay đổi mapping → auto-save (debounced)
- [ ] Scroll horizontal khi nhiều CLO

---

## Story 3.3: Approval Workflow 🟡
**Mục tiêu:** 3 bước approval flow: TK → HĐ → BGH
**Dependencies:** Story 3.1 (Syllabus CRUD + Submit)
**Branch:** `feature/CARD-XX-approval-workflow`

---

### Task 3.3.1: [BE] ApprovalService: xử lý state machine

**File tạo mới:** `Services/Interfaces/IApprovalService.cs`

```csharp
public interface IApprovalService
{
    Task<List<ApprovalStepDto>> GetStepsAsync(int syllabusId);
    Task ApproveAsync(int syllabusId, ApprovalDecisionRequest request, int reviewerId);
    Task RejectAsync(int syllabusId, ApprovalDecisionRequest request, int reviewerId);
    Task DelegateAsync(int syllabusId, int delegateToUserId, int delegatedById);
}
```

**State machine transitions:**

```
                 ┌──────────┐
                 │  Draft   │
                 └────┬─────┘
                      │ submit
                      ▼
          ┌──────────────────────┐
          │ PendingDeptApproval  │ ← TK reviews
          └──────┬───────┬──────┘
        approve  │       │ reject
                 ▼       ▼
    ┌────────────────┐  ┌──────────┐
    │ DeptApproved   │  │ Rejected │ ← back to Draft
    └──────┬─────────┘  └──────────┘
           │ auto
           ▼
  ┌─────────────────────────┐
  │ PendingCouncilReview    │ ← HĐ reviews
  └──────┬──────────┬───────┘
  approve│          │ reject
         ▼          ▼
  ┌──────────────┐  ┌──────────┐
  │CouncilApproved│  │ Rejected │
  └──────┬───────┘  └──────────┘
         │ auto
         ▼
  ┌──────────────┐
  │ PendingBGH   │ ← BGH reviews
  └──────┬───┬───┘
  approve│   │ reject
         ▼   ▼
  ┌──────────┐ ┌──────────┐
  │ Approved │ │ Rejected │
  └──────────┘ └──────────┘
```

**Implementation: approve logic:**

```csharp
public async Task ApproveAsync(int syllabusId, ApprovalDecisionRequest request, int reviewerId)
{
    var syllabus = await _context.Syllabi.FindAsync(syllabusId)
        ?? throw new NotFoundException("Đề cương không tồn tại");

    // Validate reviewer has correct role for current step
    var reviewerRoles = await GetUserRolesAsync(reviewerId);

    var (requiredRole, nextStatus) = syllabus.Status switch
    {
        "PendingDeptApproval" => ("TK", "PendingCouncilReview"),
        "PendingCouncilReview" => ("HD", "PendingBGH"),
        "PendingBGH" => ("BGH", "Approved"),
        _ => throw new BadRequestException($"Đề cương ở trạng thái {syllabus.Status} không thể approve")
    };

    if (!reviewerRoles.Contains(requiredRole))
        throw new ForbiddenException($"Bạn cần role {requiredRole} để approve bước này");

    // Update approval step
    var step = await _context.ApprovalSteps
        .Where(s => s.SyllabusId == syllabusId && s.Decision == "Pending")
        .OrderByDescending(s => s.CreatedAt)
        .FirstOrDefaultAsync()
        ?? throw new BadRequestException("Không tìm thấy bước phê duyệt pending");

    step.Decision = "Approved";
    step.ReviewerId = reviewerId;
    step.Comment = request.Comment;
    step.DecidedAt = DateTime.UtcNow;

    // Transition to next status
    syllabus.Status = nextStatus;
    syllabus.UpdatedAt = DateTime.UtcNow;

    // Tạo step tiếp theo (nếu chưa Approved cuối)
    if (nextStatus != "Approved")
    {
        var nextStepType = nextStatus switch
        {
            "PendingCouncilReview" => "CouncilReview",
            "PendingBGH" => "BGHApproval",
            _ => throw new InvalidOperationException()
        };

        _context.ApprovalSteps.Add(new ApprovalStep
        {
            SyllabusId = syllabusId,
            StepType = nextStepType,
            Decision = "Pending",
        });
    }

    await _context.SaveChangesAsync();
}
```

> [!WARNING]
> **TK tự phê duyệt:** Theo BA, khi TK là tác giả đề cương, TK tự duyệt cấp khoa. Logic `ApproveAsync` đã xử lý đúng (kiểm tra role, không kiểm tra "khác author").

**Acceptance test:**
- [ ] GV submit → status = PendingDeptApproval
- [ ] TK approve → status = PendingCouncilReview, tạo ApprovalStep mới
- [ ] HĐ approve → status = PendingBGH
- [ ] BGH approve → status = Approved (final)
- [ ] Reject ở bất kỳ bước → status = Rejected
- [ ] Wrong role approve → 403

---

### Task 3.3.2: [BE] Delegation (ủy quyền TK)
```csharp
public async Task DelegateAsync(int syllabusId, int delegateToUserId, int delegatedById)
{
    // Chỉ TK mới được delegate
    var delegatorRoles = await GetUserRolesAsync(delegatedById);
    if (!delegatorRoles.Contains("TK"))
        throw new ForbiddenException("Chỉ Trưởng khoa mới được ủy quyền");

    var step = await _context.ApprovalSteps
        .Where(s => s.SyllabusId == syllabusId && s.StepType == "DeptApproval" && s.Decision == "Pending")
        .FirstOrDefaultAsync()
        ?? throw new BadRequestException("Không có bước phê duyệt cấp khoa nào đang pending");

    step.DelegatedById = delegatedById;
    step.ReviewerId = delegateToUserId;

    await _context.SaveChangesAsync();
}
```

**Acceptance test:**
- [ ] TK delegate cho GV khác → GV đó có thể approve cấp khoa
- [ ] Non-TK delegate → 403

---

*Tiếp theo: [EPIC 4: Dashboard, Notifications & Polish](./04-epic4-dashboard-polish.md)*