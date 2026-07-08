
namespace StartupBackend.DTOs
{
    // DTO hứng dữ liệu từ giao diện khi Quản lý bấm "Tạo môn học" hoặc "Cập nhật môn học"
    public class ManagerSubjectRequest
    {
        public string MaMonHoc { get; set; } = string.Empty;
        public string TenMonHoc { get; set; } = string.Empty;
        public int SoTinChiLyThuyet { get; set; }
        public int SoTinChiThucHanh { get; set; }
        public string ChuongTrinhDaoTaoMa { get; set; } = string.Empty;
        public string TrangThaiHoanThanh { get; set; } = string.Empty; // Tình trạng biên soạn (Hoàn thành/Chưa hoàn thành)
    }

    // DTO trả dữ liệu ra danh sách môn học cho UI hiển thị
    public class ManagerSubjectResponse
    {
        public string MaMonHoc { get; set; } = string.Empty;
        public string TenMonHoc { get; set; } = string.Empty;
        public int SoTinChiLyThuyet { get; set; }
        public int SoTinChiThucHanh { get; set; }
        public int TongSoTinChi { get; set; } // Tính tổng lý thuyết + thực hành
        public string TrangThaiHoanThanh { get; set; } = string.Empty; // Tình trạng biên soạn (Hoàn thành/Chưa)
        public string TinhTrangPhanCong { get; set; } = string.Empty; // Tình trạng phân công (Đã phân công/Chưa phân công)
    }
}