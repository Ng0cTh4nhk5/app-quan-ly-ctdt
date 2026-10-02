namespace StartupBackend.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }
        public string? TraceId { get; set; }

        // Dùng khi báo lỗi
        public static ApiResponse<T> Fail(int statusCode, string message, string traceId)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                TraceId = traceId
            };
        }

        // Dùng khi thành công
        public static ApiResponse<T> Ok(T data, string message = "Thành công")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 200,
                Message = message,
                Data = data
            };
        }
    }
}