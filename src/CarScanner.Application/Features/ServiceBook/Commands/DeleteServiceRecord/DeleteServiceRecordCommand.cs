using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.ServiceBook.Commands.DeleteServiceRecord;

public sealed record DeleteServiceRecordCommand(Guid ServiceRecordId) : ICommand<Result>;
