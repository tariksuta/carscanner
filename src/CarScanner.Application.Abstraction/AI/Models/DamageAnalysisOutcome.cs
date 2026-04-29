namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record DamageAnalysisOutcome(
    DamageAnalysisResult Result,
    TokenUsage? Usage);
