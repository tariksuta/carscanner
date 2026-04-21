using CarScanner.SharedKernel.Interfaces;
using MediatR;

namespace CarScanner.SharedKernel.CQRS;

public interface IDomainEventHandler<TDomainEvent> : INotificationHandler<TDomainEvent>
    where TDomainEvent : IDomainEvent
{
}
