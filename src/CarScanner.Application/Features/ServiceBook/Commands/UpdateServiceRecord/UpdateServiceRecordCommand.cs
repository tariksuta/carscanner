using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.UpdateServiceRecord;

public sealed record UpdateServiceRecordCommand(
    Guid ServiceRecordId,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string? Currency,
    string? Description,
    string? WorkshopName,
    string? WorkshopContact) : ICommand<Result>;
