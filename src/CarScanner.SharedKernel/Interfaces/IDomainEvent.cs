using MediatR;

namespace CarScanner.SharedKernel.Interfaces;

public interface IDomainEvent : INotification
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}
