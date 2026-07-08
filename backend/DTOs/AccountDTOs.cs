namespace StartupBackend.DTOs
{
    public class AccountDTOs
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string Khoa { get; set; } = string.Empty;
        public string? Programs { get; set; } = string.Empty;
        public string? HocHam { get; set; } = string.Empty;
        public string? HocVi { get; set; } = string.Empty;
        public string? TrinhDoChuyenMon { get; set; } = string.Empty;

    }

    public class AccountResponse    
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; 
        public string Programs { get; set; } = string.Empty; 
        public string ProgramsName { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string HocHam { get; set; } = string.Empty;
        public string HocVi { get; set; } = string.Empty;
        public string TrinhDoChuyenMon { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; 
        public DateTime CreatedAt { get; set; }
    }

    public class PagedAccountResponse
    {
        public int Total { get; set; }
        public List<AccountResponse> Data { get; set; } = new();
    }

    public class UpdateAccountRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Khoa { get; set; }
        public string? ProgramsId { get; set; }
        public string? HocHam { get; set; }
        public string? HocVi { get; set; }
        public string? TrinhDoChuyenMon { get; set; }

    }
}
