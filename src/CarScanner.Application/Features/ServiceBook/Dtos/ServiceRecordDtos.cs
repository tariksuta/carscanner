using CarScanner.Domain.Enums;

namespace CarScanner.Application.Features.ServiceBook.Dtos;

public sealed record ServiceRecordSummaryDto(
    Guid Id,
    Guid VehicleId,
    string VehicleDisplayName,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string Currency,
    string? WorkshopName);

public sealed record ServiceRecordDetailDto(
    Guid Id,
    Guid VehicleId,
    string VehicleDisplayName,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string Currency,
    string Description,
    string? WorkshopName,
    string? WorkshopContact,
    Guid? CreatedByEmployeeId,
    DateTime CreatedOnUtc,
    IReadOnlyList<ServiceDocumentDto> Documents);

public sealed record ServiceDocumentDto(
    string Url,
    string FileName,
    string ContentType,
    DateTime UploadedAtUtc);
