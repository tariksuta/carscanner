using CarScanner.Domain.Enums;

namespace CarScanner.Application.Abstraction.AI.Models;

public sealed record PhotoPair(
    PhotoPosition Position,
    string PickupPhotoUrl,
    string ReturnPhotoUrl);
