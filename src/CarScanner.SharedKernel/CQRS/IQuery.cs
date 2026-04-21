using MediatR;

namespace CarScanner.SharedKernel.CQRS;

public interface IQuery<out TResponse> : IRequest<TResponse>
{
}
