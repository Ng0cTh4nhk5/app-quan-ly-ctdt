using System.Net;
using System.Text.Json;

namespace StartupBackend.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        var (statusCode, message) = exception switch
        {
            UnauthorizedException => (HttpStatusCode.Unauthorized, exception.Message),
            ForbiddenException => (HttpStatusCode.Forbidden, exception.Message),
            NotFoundException => (HttpStatusCode.NotFound, exception.Message),
            BadRequestException => (HttpStatusCode.BadRequest, exception.Message),
            _ => (HttpStatusCode.InternalServerError, "Lỗi hệ thống. Vui lòng thử lại sau.")
        };

        // Log chi tiết (chỉ server thấy)
        _logger.LogError(exception, "Unhandled exception | TraceId: {TraceId}", traceId);

        // Response cho client (KHÔNG có stack trace)
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        // Response cho client (KHÔNG có stack trace)
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        // Gói dữ liệu vào cái hộp
        var response = StartupBackend.DTOs.ApiResponse<object>.Fail((int)statusCode, message, traceId);

        await context.Response.WriteAsJsonAsync(response);

        await context.Response.WriteAsJsonAsync(response);
    }
}

// Custom exceptions
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}