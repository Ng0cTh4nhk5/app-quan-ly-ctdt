using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace StartupBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private static readonly HttpClient _httpClient = new HttpClient();

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async System.Threading.Tasks.Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            var apiKey = _config["EmailSettings:BrevoApiKey"];

            var payload = new
            {
                sender = new
                {
                    name = _config["EmailSettings:SenderName"],
                    email = _config["EmailSettings:SenderEmail"]
                },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = htmlMessage
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Add("api-key", apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Brevo API error {response.StatusCode}: {responseBody}");
            }
        }
    }
}