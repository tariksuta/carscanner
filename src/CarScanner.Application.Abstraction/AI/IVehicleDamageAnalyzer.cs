using CarScanner.Application.Abstraction.AI.Models;

namespace CarScanner.Application.Abstraction.AI;

public interface IVehicleDamageAnalyzer
{
    Task<DamageAnalysisResult> AnalyzeDamageAsync(
        DamageAnalysisRequest request,
        CancellationToken cancellationToken = default);
}
