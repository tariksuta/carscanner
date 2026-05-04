using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Entities;

public sealed class Reservation : Entity<Guid>
{
    public Guid BillingAccountId { get; private set; }
    public decimal Amount { get; private set; }
    public ReservationStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }
    public decimal? ActualCost { get; private set; }

    private Reservation() { }

    private Reservation(Guid billingAccountId, decimal amount, DateTime nowUtc)
        : base(Guid.NewGuid())
    {
        BillingAccountId = billingAccountId;
        Amount = amount;
        Status = ReservationStatus.Pending;
        CreatedAtUtc = nowUtc;
    }

    internal static Reservation Create(Guid billingAccountId, decimal amount, DateTime nowUtc)
    {
        return new Reservation(billingAccountId, amount, nowUtc);
    }

    internal void Commit(decimal actualCost, DateTime nowUtc)
    {
        Status = ReservationStatus.Committed;
        ActualCost = actualCost;
        CompletedAtUtc = nowUtc;
    }

    internal void Refund(DateTime nowUtc)
    {
        Status = ReservationStatus.Refunded;
        ActualCost = 0m;
        CompletedAtUtc = nowUtc;
    }
}
