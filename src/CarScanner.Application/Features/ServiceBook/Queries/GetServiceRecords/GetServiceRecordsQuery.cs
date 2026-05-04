using CarScanner.Application.Features.ServiceBook.Dtos;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecords;

public sealed record GetServiceRecordsQuery(
    Guid? VehicleId = null,
    int Page = 1,
    int PageSize = 20) : IQuery<Result<PagedResult<ServiceRecordSummaryDto>>>;
