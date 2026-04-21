namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record DamageAnalysisRequest(
    Guid RentalId,
    Guid PickupInspectionId,
    Guid ReturnInspectionId,
    string VehicleInfo,
    IReadOnlyList<PhotoPair> PhotoPairs);
