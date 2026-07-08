namespace StartupBackend.DTOs
{
    public class SubjectCreateDTOs
    {
        public string MaMonHoc { get; set; } 
        public string TenMonHoc { get; set; }
        public int SoTinChiLyThuyet { get; set; }
        public int SoTinChiThucHanh { get; set; }
        public string TrangThaiHoanThanh { get; set; } = "Chưa hoàn thành"; // Mặc định khi mới tạo
        public string ChuongTrinhDaoTaoMa { get; set; }
    }
}
