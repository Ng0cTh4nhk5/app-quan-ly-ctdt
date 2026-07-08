namespace StartupBackend.DTOs
{
    // DTO hứng dữ liệu khi bấm nút "Tạo" trong modal Phân công soạn đề cương
    public class CreateAssignmentRequest
    {
        public int CompilerId { get; set; } // ID của thành viên biên soạn được chọn
        public List<string> SubjectIds { get; set; } = new List<string>(); // Danh sách mã môn học được check chọn
    }
}