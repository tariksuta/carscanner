using CarScanner.Domain.Aggregates.ServiceBookAggregate.Errors;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.DeleteServiceRecord;

public sealed class DeleteServiceRecordCommandHandler(
    IServiceRecordRepository serviceRecordRepository)
    : ICommandHandler<DeleteServiceRecordCommand, Result>
{
    public async Task<Result> Handle(
        DeleteServiceRecordCommand request,
        CancellationToken cancellationToken)
    {
        var record = await serviceRecordRepository.GetByIdAsync(request.ServiceRecordId, cancellationToken);
        if (record is null)
            return Result.Failure(ServiceBookDomainErrors.NotFound(request.ServiceRecordId));

        serviceRecordRepository.Remove(record);
        return Result.Success();
    }
}
