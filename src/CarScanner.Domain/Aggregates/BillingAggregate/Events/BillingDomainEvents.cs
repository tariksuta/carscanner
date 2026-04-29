using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Events;

public sealed record BalanceToppedUpDomainEvent(
    Guid BillingAccountId,
    Guid TenantId,
    decimal Amount,
    decimal NewBalance,
    string Reference) : DomainEvent;

public sealed record LowBalanceReachedDomainEvent(
    Guid BillingAccountId,
    Guid TenantId,
    decimal Balance,
    decimal Threshold) : DomainEvent;

public sealed record BalanceExhaustedDomainEvent(
    Guid BillingAccountId,
    Guid TenantId) : DomainEvent;

public sealed record MonthlyCapReachedDomainEvent(
    Guid BillingAccountId,
    Guid TenantId,
    decimal Cap,
    decimal MonthSpent) : DomainEvent;
