using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecordById;

public sealed record GetServiceRecordByIdQuery(Guid ServiceRecordId)
    : IQuery<Result<ServiceRecordDetailDto>>;
