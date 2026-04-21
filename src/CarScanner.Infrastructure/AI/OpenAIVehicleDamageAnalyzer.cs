using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CarScanner.Infrastructure.AI;

public sealed class OpenAIVehicleDamageAnalyzer : IVehicleDamageAnalyzer
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAIVehicleDamageAnalyzer> _logger;
    private readonly string _apiKey;
    private readonly string _model;

    public OpenAIVehicleDamageAnalyzer(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAIVehicleDamageAnalyzer> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API key not configured");
        _model = configuration["OpenAI:Model"] ?? "gpt-4o";

        _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<DamageAnalysisResult> AnalyzeDamageAsync(
        DamageAnalysisRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var messages = BuildMessages(request);
            var requestBody = new
            {
                model = _model,
                messages,
                max_tokens = 4096,
                response_format = new { type = "json_object" }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("OpenAI API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                return DamageAnalysisResult.Failed($"AI service error: {response.StatusCode}");
            }

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = ParseResponse(responseJson);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during damage analysis for rental {RentalId}", request.RentalId);
            return DamageAnalysisResult.Failed($"Analysis failed: {ex.Message}");
        }
    }

    private static List<object> BuildMessages(DamageAnalysisRequest request)
    {
        var prompt = GetSystemPrompt(request.VehicleInfo);

        var imageContent = new List<object>
        {
            new { type = "text", text = prompt }
        };

        foreach (var pair in request.PhotoPairs)
        {
            imageContent.Add(new
            {
                type = "text",
                text = $"--- {pair.Position} - BEFORE (Pickup) ---"
            });
            imageContent.Add(new
            {
                type = "image_url",
                image_url = new { url = pair.PickupPhotoUrl }
            });

            imageContent.Add(new
            {
                type = "text",
                text = $"--- {pair.Position} - AFTER (Return) ---"
            });
            imageContent.Add(new
            {
                type = "image_url",
                image_url = new { url = pair.ReturnPhotoUrl }
            });
        }

        return
        [
            new
            {
                role = "user",
                content = imageContent
            }
        ];
    }

    private static string GetSystemPrompt(string vehicleInfo)
    {
        return $@"You are an expert vehicle damage inspector for a rent-a-car company.

Vehicle: {vehicleInfo}

I will show you pairs of photos - one from when the vehicle was picked up (BEFORE),
and one from when it was returned (AFTER).

For each position (Front, Back, LeftSide, RightSide), compare the BEFORE and AFTER photos
and identify ANY new damage that appeared during the rental period.

Look for:
- Scratches
- Dents
- Cracks (windshield, lights, mirrors)
- Paint damage
- Missing parts
- Any other visible damage

Respond in JSON format:
{{
    ""hasDamages"": true/false,
    ""damages"": [
        {{
            ""position"": ""Front"" | ""Back"" | ""LeftSide"" | ""RightSide"",
            ""description"": ""Detailed description of the damage"",
            ""severity"": ""Minor"" | ""Moderate"" | ""Severe"",
            ""estimatedCost"": 100.00,
            ""confidenceScore"": 0.95
        }}
    ]
}}

Be thorough but only report NEW damage that wasn't present in the BEFORE photos.";
    }

    private DamageAnalysisResult ParseResponse(string responseJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;

            var content = root
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrEmpty(content))
                return DamageAnalysisResult.Failed("Empty response from AI");

            using var contentDoc = JsonDocument.Parse(content);
            var contentRoot = contentDoc.RootElement;

            var hasDamages = contentRoot.GetProperty("hasDamages").GetBoolean();

            if (!hasDamages)
                return DamageAnalysisResult.NoDamageFound(content);

            var damages = new List<DetectedDamage>();

            if (contentRoot.TryGetProperty("damages", out var damagesArray))
            {
                foreach (var damage in damagesArray.EnumerateArray())
                {
                    var position = Enum.Parse<PhotoPosition>(damage.GetProperty("position").GetString()!);
                    var description = damage.GetProperty("description").GetString()!;
                    var severity = Enum.Parse<DamageSeverity>(damage.GetProperty("severity").GetString()!);

                    decimal? estimatedCost = null;
                    if (damage.TryGetProperty("estimatedCost", out var costProp))
                        estimatedCost = costProp.GetDecimal();

                    var confidenceScore = damage.TryGetProperty("confidenceScore", out var confProp)
                        ? confProp.GetDouble()
                        : 0.8;

                    damages.Add(new DetectedDamage(position, description, severity, estimatedCost, confidenceScore));
                }
            }

            return DamageAnalysisResult.DamagesFound(damages, content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing OpenAI response");
            return DamageAnalysisResult.Failed($"Failed to parse AI response: {ex.Message}");
        }
    }
}
