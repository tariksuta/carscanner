namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record TokenUsage(
    int PromptTokens,
    int CompletionTokens,
    string Model)
{
    public int TotalTokens => PromptTokens + CompletionTokens;
}
