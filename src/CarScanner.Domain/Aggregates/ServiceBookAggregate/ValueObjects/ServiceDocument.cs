namespace CarScanner.Domain.Aggregates.ServiceBookAggregate.ValueObjects;

public sealed record ServiceDocument(
    string Url,
    string FileName,
    string ContentType,
    DateTime UploadedAtUtc);
