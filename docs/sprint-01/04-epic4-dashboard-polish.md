# EPIC 4: Dashboard, Notifications & Polish: Implementation Guide

**Sprint 3: Tuần 7 đến Tuần 8** | **Priority: 🟢 P3**
**Tham chiếu:** [Task Breakdown](../audit-reports/task_breakdown.md) · [Code Standards](../convention/00-code-standards.md)

> [!NOTE]
> Sprint 3: MVP hoàn thiện tính năng. Dashboard, thời gian thực notifications, E2E testing, deployment prep.

---

## Story 4.1: Dashboard theo vai trò 🟢

**Mục tiêu:** Mỗi role thấy dashboard phù hợp với nhiệm vụ
**Dependencies:** EPIC 3 (business logic hoàn thành)
**Branch:** `feature/CARD-XX-dashboards`

---

### Task 4.1.1: [BE] Dashboard stats API

**File tạo mới:** `Services/Interfaces/IDashboardService.cs`

```csharp
public interface IDashboardService
{
    Task<DashboardStats> GetStatsAsync(int userId, List<string> roles);
}

public class DashboardStats
{
    // PM sees
    public int? TotalAccounts { get; set; }
    public int? TotalPrograms { get; set; }
    public int? TotalFaculties { get; set; }

    // TK / GV sees
    public int? MySyllabi { get; set; }
    public int? PendingApproval { get; set; }
    public int? ApprovedCount { get; set; }
    public int? RejectedCount { get; set; }

    // Recent activity
    public List<RecentActivityDto> RecentActivity { get; set; } = new();
}

public class RecentActivityDto
{
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
```

**Controller:**
```csharp
[HttpGet("api/dashboard")]
[Authorize]
public async Task<ActionResult<ApiResponse<DashboardStats>>> GetDashboard()
{
    var userId = GetCurrentUserId();
    var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    var stats = await _dashboardService.GetStatsAsync(userId, roles);
    return Ok(ApiResponse<DashboardStats>.Success(stats));
}
```

**Acceptance test:**
- [ ] PM dashboard → thấy total accounts, programs, faculties
- [ ] GV dashboard → thấy my syllabi, pending, approved counts
- [ ] TK dashboard → thấy pending approvals cần xử lý

---

### Task 4.1.2: [FE] Dashboard pages per role
**File tạo mới:** `src/features/dashboard/pages/DashboardPage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Typography } from 'antd';
import {
  UserOutlined, BookOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../auth/store/authStore';
import { dashboardApi } from '../../../services/dashboardApi';
import type { DashboardStats } from '../../../types/api.types';
import { Role } from '../../../constants/roles';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.getStats().then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  const isPM = user?.roles.includes(Role.PM);

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>
        Xin chào, {user?.fullName} 👋
      </Typography.Title>

      <Row gutter={[16, 16]}>
        {isPM && (
          <>
            <Col xs={24} sm={8}>
              <Card><Statistic title="Tài khoản" value={stats.totalAccounts} prefix={<UserOutlined />} /></Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card><Statistic title="Chương trình" value={stats.totalPrograms} prefix={<BookOutlined />} /></Card>
            </Col>
          </>
        )}

        <Col xs={24} sm={8}>
          <Card><Statistic title="Đề cương của tôi" value={stats.mySyllabi} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Chờ duyệt" value={stats.pendingApproval} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Đã duyệt" value={stats.approvedCount} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Hoạt động gần đây" style={{ marginTop: 16 }}>
        <List
          dataSource={stats.recentActivity}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`${item.userName} — ${item.action}`}
                description={`${item.entityName} • ${new Date(item.timestamp).toLocaleString('vi')}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
```

**Acceptance test:**
- [ ] Dashboard responsive (xs/sm/md breakpoints)
- [ ] Stats số liệu khớp DB thực tế
- [ ] Recent activity hiển thị 10 items gần nhất

---

## Story 4.2: Notification System 🟢
**Mục tiêu:** In app notifications khi có approval event
**Dependencies:** Story 3.3 (Approval workflow)
**Branch:** `feature/CARD-XX-notifications`

---

### Task 4.2.1: [BE] Notification model + service

**File tạo mới:** `Models/Notification.cs`

```csharp
public class Notification
{
    [Key]
    public long Id { get; set; }

    public int UserId { get; set; }

    [Required, MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "Info";      // Info | Approval | Rejection

    [MaxLength(200)]
    public string? Link { get; set; }                // e.g., "/syllabus/5"

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public Accounts User { get; set; } = null!;
}
```

**Service skeleton:**
```csharp
public interface INotificationService
{
    Task<List<NotificationDto>> GetUnreadAsync(int userId);
    Task MarkAsReadAsync(long notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
    Task CreateAsync(int userId, string message, string type, string? link);
}
```

**Tích hợp vào ApprovalService: sau mỗi approve/reject:**
```csharp
// Trong ApproveAsync, sau SaveChanges:
await _notificationService.CreateAsync(
    syllabus.AuthorId,
    $"Đề cương \"{syllabus.SubjectName}\" đã được duyệt bước {step.StepType}",
    "Approval",
    $"/syllabus/{syllabusId}"
);
```

**Acceptance test:**
- [ ] Approve → tác giả nhận notification
- [ ] Reject → tác giả nhận notification với type = Rejection
- [ ] `GET /api/notifications?unread=true` trả list
- [ ] `PUT /api/notifications/{id}/read` mark as read

---

### Task 4.2.2: [FE] Notification bell + dropdown
```tsx
// Pattern — dùng Ant Design Badge + Popover
import { Badge, Popover, List, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  // Poll every 30s (hoặc WebSocket nếu có SignalR)
  useEffect(() => {
    const interval = setInterval(fetchUnread, 30000);
    fetchUnread();
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover
      trigger="click"
      title="Thông báo"
      content={
        <List
          dataSource={notifications}
          renderItem={(n) => (
            <List.Item onClick={() => handleClick(n)}>
              <List.Item.Meta title={n.message} description={timeAgo(n.createdAt)} />
            </List.Item>
          )}
        />
      }
    >
      <Badge count={notifications.length} size="small">
        <BellOutlined style={{ fontSize: 20 }} />
      </Badge>
    </Popover>
  );
};
```

**Acceptance test:**
- [ ] Badge hiển thị số notification chưa đọc
- [ ] Click notification → navigate đến link
- [ ] Mark all as read hoạt động

---

## Story 4.3: Testing & Quality 🟢
**Mục tiêu:** Unit tests cho critical paths, API integration tests
**Dependencies:** Tất cả stories trước
**Branch:** `feature/CARD-XX-testing`

---

### Task 4.3.1: [BE] Unit test setup + Auth tests

**Cài dependencies:**
```bash
cd apps/backend
dotnet add package xunit
dotnet add package Moq
dotnet add package Microsoft.EntityFrameworkCore.InMemoryDatabase
```

**File test mẫu:** `Tests/Services/AuthServiceTests.cs`

```csharp
public class AuthServiceTests
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test_secret_key_minimum_32_characters_long",
                ["Jwt:Issuer"] = "Test",
                ["Jwt:Audience"] = "Test",
            })
            .Build();

        _authService = new AuthService(_context, config);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var role = new Roles { Id = 1, TenVaiTro = "GV" };
        _context.VaiTros.Add(role);
        _context.TaiKhoans.Add(new Accounts
        {
            Id = 1,
            TenDangNhap = "teacher1",
            MatKhau = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            HoTenNguoiDung = "GV Test",
            VaiTroId = 1,
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _authService.LoginAsync(new LoginRequest
        {
            Username = "teacher1",
            Password = "Pass@123"
        });

        // Assert
        Assert.NotNull(result.Token);
        Assert.NotNull(result.RefreshToken);
    }

    [Fact]
    public async Task Login_WrongPassword_ThrowsUnauthorized()
    {
        // Arrange — same as above
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _authService.LoginAsync(new LoginRequest
            {
                Username = "teacher1",
                Password = "WrongPassword"
            })
        );
    }
}
```

---

### Task 4.3.2: [BE] Approval workflow integration test

```csharp
[Fact]
public async Task FullApprovalFlow_DraftToApproved()
{
    // Arrange: Tạo GV, TK, HD, BGH users + syllabus
    // Act 1: GV submit
    await _syllabusService.SubmitForApprovalAsync(syllabusId, gvUserId);
    Assert.Equal("PendingDeptApproval", syllabus.Status);

    // Act 2: TK approve
    await _approvalService.ApproveAsync(syllabusId, new() { Comment = "OK" }, tkUserId);
    Assert.Equal("PendingCouncilReview", syllabus.Status);

    // Act 3: HD approve
    await _approvalService.ApproveAsync(syllabusId, new() { Comment = "Đạt" }, hdUserId);
    Assert.Equal("PendingBGH", syllabus.Status);

    // Act 4: BGH approve
    await _approvalService.ApproveAsync(syllabusId, new() { Comment = "Phê duyệt" }, bghUserId);
    Assert.Equal("Approved", syllabus.Status);

    // Assert: 3 approval steps, all Approved
    var steps = await _context.ApprovalSteps
        .Where(s => s.SyllabusId == syllabusId)
        .ToListAsync();
    Assert.Equal(3, steps.Count);
    Assert.All(steps, s => Assert.Equal("Approved", s.Decision));
}
```

---

### Task 4.3.3: [FE] Basic smoke tests (Playwright / Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Vitest config:**
```typescript
// vite.config.ts — thêm:
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
}
```

**Test mẫu:**
```typescript
// src/features/auth/__tests__/LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../pages/LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
  });

  it('shows validation error on empty submit', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Đăng nhập'));
    expect(await screen.findByText('Nhập tên đăng nhập')).toBeInTheDocument();
  });
});
```

**Acceptance test:**
- [ ] `dotnet test`: all BE tests pass
- [ ] `npm run test`: all FE tests pass
- [ ] Coverage > 60% cho critical paths (auth, approval)

---

## 🟢 Sprint 3 Checklist: Definition of Done
| Story | Deliverable | Verify |
|-------|------------|--------|
| 4.1 | Dashboard theo vai trò | PM/GV/TK thấy stats khác nhau |
| 4.2 | In app notifications | Approve → bell shows count |
| 4.3 | Unit + integration tests | `dotnet test` + `npm test` pass |

---

## MVP Completion Checklist

> [!TIP]
> Khi tất cả 4 EPICs hoàn thành, chạy E2E flow sau:

1. **PM** đăng nhập → Dashboard hiển thị stats → Tạo tài khoản GV
2. **GV** đăng nhập → Tạo đề cương → Thêm CLO → Map PLO CLO → Submit
3. **TK** đăng nhập → Thấy notification → Approve cấp khoa
4. **HĐ** đăng nhập → Thấy notification → Approve hội đồng
5. **BGH** đăng nhập → Thấy notification → Approve cuối cùng
6. **GV** thấy notification "Đề cương đã được phê duyệt" 🟢

**Nếu flow trên chạy hoàn chỉnh → MVP ready for demo.**
