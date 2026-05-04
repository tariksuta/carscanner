using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.Domain.Aggregates.ServiceBookAggregate;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.CreateServiceRecord;

public sealed class CreateServiceRecordCommandHandler(
    ITenantProvider tenantProvider,
    IUserPrincipal userPrincipal,
    IVehicleRepository vehicleRepository,
    IServiceRecordRepository serviceRecordRepository)
    : ICommandHandler<CreateServiceRecordCommand, Result<CreateServiceRecordCommandResult>>
{
    public async Task<Result<CreateServiceRecordCommandResult>> Handle(
        CreateServiceRecordCommand request,
        CancellationToken cancellationToken)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle is null)
            return Result.Failure<CreateServiceRecordCommandResult>(VehicleDomainErrors.NotFound(request.VehicleId));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = ServiceRecord.Create(
            tenantProvider.TenantId,
            request.VehicleId,
            request.ServiceDate,
            request.MileageAtService,
            request.Type,
            request.Cost,
            request.Currency,
            request.Description,
            request.WorkshopName,
            request.WorkshopContact,
            createdByEmployeeId: userPrincipal.UserId == Guid.Empty ? null : userPrincipal.UserId,
            today);

        if (result.IsFailure)
            return Result.Failure<CreateServiceRecordCommandResult>(result.Error);

        serviceRecordRepository.Add(result.Value);

        // Ažuriraj kilometražu na vozilu ako je servisni unos noviji.
        vehicle.UpdateMileage(request.MileageAtService);

        return new CreateServiceRecordCommandResult(result.Value.Id);
    }
}
