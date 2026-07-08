namespace StartupBackend.DTOs
{
    // DTO hứng dữ liệu khi Quản lý tạo tài khoản thành viên (Biên soạn/Hội đồng)
    public class ManagerCreateMemberRequest
    {
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int RoleId { get; set; } // Loại tài khoản (VD: 3 là COMPILER)
        public string? HocHam { get; set; }
        public string? HocVi { get; set; }
        public string? TrinhDoChuyenMon { get; set; }
    }

    // DTO hứng dữ liệu khi Quản lý cập nhật tài khoản
    public class ManagerUpdateMemberRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? HocHam { get; set; }
        public string? HocVi { get; set; }
        public string? TrinhDoChuyenMon { get; set; }
    }

    // DTO trả dữ liệu ra bảng danh sách thành viên
    public class ManagerMemberResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? HocHam { get; set; }
        public string? HocVi { get; set; }
        public string? TrinhDoChuyenMon { get; set; }
        public string Status { get; set; } = string.Empty; // Hoạt động, Đã thu hồi...
        public string PhanCong { get; set; } = string.Empty; // Hiển thị tên môn đang được phân công (nếu có)
    }

    // DTO nhận danh sách ID để thao tác hàng loạt (Gửi mail, Thu hồi quyền)
    public class BulkActionRequest
    {
        public List<int> AccountIds { get; set; } = new List<int>();
    }
}