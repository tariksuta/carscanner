using CarScanner.Domain.Aggregates.ServiceBookAggregate.Errors;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.UpdateServiceRecord;

public sealed class UpdateServiceRecordCommandHandler(
    IServiceRecordRepository serviceRecordRepository)
    : ICommandHandler<UpdateServiceRecordCommand, Result>
{
    public async Task<Result> Handle(
        UpdateServiceRecordCommand request,
        CancellationToken cancellationToken)
    {
        var record = await serviceRecordRepository.GetByIdAsync(request.ServiceRecordId, cancellationToken);
        if (record is null)
            return Result.Failure(ServiceBookDomainErrors.NotFound(request.ServiceRecordId));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = record.Update(
            request.ServiceDate,
            request.MileageAtService,
            request.Type,
            request.Cost,
            request.Currency,
            request.Description,
            request.WorkshopName,
            request.WorkshopContact,
            today);

        if (result.IsFailure)
            return result;

        serviceRecordRepository.Update(record);
        return Result.Success();
    }
}
