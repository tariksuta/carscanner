using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetRemindersForVehicle;

public sealed record GetRemindersForVehicleQuery(
    Guid VehicleId,
    bool IncludeInactive = false) : IQuery<Result<IReadOnlyList<ReminderDto>>>;
