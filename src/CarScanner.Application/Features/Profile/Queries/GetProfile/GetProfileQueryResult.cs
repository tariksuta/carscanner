namespace CarScanner.Application.Features.Profile.Queries.GetProfile;

public sealed record GetProfileQueryResult(
    string Email,
    string? FirstName,
    string? LastName,
    string? Street,
    string? City,
    string? ZipCode,
    string? Country,
    string? ProfileImageUrl,
    Guid? EmployeeId);
