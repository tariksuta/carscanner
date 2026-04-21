using CarScanner.Domain.Enums;

namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record DetectedDamage(
    PhotoPosition Position,
    string Description,
    DamageSeverity Severity,
    decimal? EstimatedCost,
    double ConfidenceScore);
