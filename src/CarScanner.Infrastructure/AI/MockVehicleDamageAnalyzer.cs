using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure.AI;

public sealed class MockVehicleDamageAnalyzer(ILogger<MockVehicleDamageAnalyzer> logger)
    : IVehicleDamageAnalyzer
{
    public Task<DamageAnalysisResult> AnalyzeDamageAsync(
        DamageAnalysisRequest request,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "Mock damage analysis for rental {RentalId} with {PhotoCount} photo pairs",
            request.RentalId,
            request.PhotoPairs.Count);

        var random = new Random();
        var hasDamage = random.Next(100) < 30;

        if (!hasDamage)
        {
            return Task.FromResult(DamageAnalysisResult.NoDamageFound(
                "{\"hasDamages\": false, \"damages\": []}"));
        }

        var damages = new List<DetectedDamage>();
        var positions = request.PhotoPairs.Select(p => p.Position).ToList();

        var damagePosition = positions[random.Next(positions.Count)];
        var severity = (DamageSeverity)random.Next(3);
        var estimatedCost = severity switch
        {
            DamageSeverity.Minor => random.Next(50, 200),
            DamageSeverity.Moderate => random.Next(200, 500),
            DamageSeverity.Severe => random.Next(500, 2000),
            _ => 100
        };

        damages.Add(new DetectedDamage(
            damagePosition,
            $"Mock detected {severity.ToString().ToLower()} damage on {damagePosition} of vehicle",
            severity,
            estimatedCost,
            0.85 + random.NextDouble() * 0.1));

        logger.LogInformation(
            "Mock analysis found {DamageCount} damages for rental {RentalId}",
            damages.Count,
            request.RentalId);

        return Task.FromResult(DamageAnalysisResult.DamagesFound(
            damages,
            $"{{\"hasDamages\": true, \"damages\": [{damages.Count} items]}}"));
    }
}
