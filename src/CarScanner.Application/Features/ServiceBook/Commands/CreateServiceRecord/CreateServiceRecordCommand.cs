using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.CreateServiceRecord;

public sealed record CreateServiceRecordCommand(
    Guid VehicleId,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string? Currency,
    string? Description,
    string? WorkshopName,
    string? WorkshopContact) : ICommand<Result<CreateServiceRecordCommandResult>>;

public sealed record CreateServiceRecordCommandResult(Guid ServiceRecordId);
