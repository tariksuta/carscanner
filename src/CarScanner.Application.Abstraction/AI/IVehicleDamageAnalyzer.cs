using CarScanner.Application.Abstraction.AI.Models;

namespace CarScanner.Application.Abstraction.AI;

public interface IVehicleDamageAnalyzer
{
    Task<DamageAnalysisOutcome> AnalyzeDamageAsync(
        DamageAnalysisRequest request,
        CancellationToken cancellationToken = default);
}
