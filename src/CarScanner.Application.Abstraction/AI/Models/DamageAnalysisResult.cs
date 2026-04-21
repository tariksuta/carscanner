namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record DamageAnalysisResult(
    bool Success,
    bool HasDamages,
    IReadOnlyList<DetectedDamage> Damages,
    string? RawResponse,
    string? ErrorMessage)
{
    public static DamageAnalysisResult NoDamageFound(string? rawResponse) =>
        new(true, false, [], rawResponse, null);

    public static DamageAnalysisResult DamagesFound(IReadOnlyList<DetectedDamage> damages, string? rawResponse) =>
        new(true, true, damages, rawResponse, null);

    public static DamageAnalysisResult Failed(string errorMessage) =>
        new(false, false, [], null, errorMessage);
}
