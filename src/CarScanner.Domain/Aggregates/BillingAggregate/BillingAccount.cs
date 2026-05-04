using CarScanner.Domain.Aggregates.BillingAggregate.Entities;
using CarScanner.Domain.Aggregates.BillingAggregate.Errors;
using CarScanner.Domain.Aggregates.BillingAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate;

public sealed class BillingAccount : AggregateRoot
{
    public const int MaxCurrencyLength = 3;
    public const string DefaultCurrency = "USD";

    private readonly List<Reservation> _reservations = [];

    public Guid TenantId { get; private set; }
    public string Currency { get; private set; } = DefaultCurrency;
    public decimal Balance { get; private set; }
    public decimal LifetimeToppedUp { get; private set; }
    public decimal LifetimeSpent { get; private set; }
    public decimal? MonthlyHardCap { get; private set; }
    public decimal MonthSpent { get; private set; }
    public DateTime MonthAnchorUtc { get; private set; }
    public decimal? LowBalanceThreshold { get; private set; }
    public bool LowBalanceAlertSentForCurrentDip { get; private set; }
    public Guid? CurrentPricingPlanId { get; private set; }

    public IReadOnlyCollection<Reservation> Reservations => _reservations.AsReadOnly();

    private BillingAccount() { }

    private BillingAccount(Guid tenantId, string currency, DateTime nowUtc) : base()
    {
        TenantId = tenantId;
        Currency = currency;
        Balance = 0m;
        LifetimeToppedUp = 0m;
        LifetimeSpent = 0m;
        MonthSpent = 0m;
        MonthAnchorUtc = MonthAnchor(nowUtc);
    }

    public static BillingAccount Provision(Guid tenantId, string currency = DefaultCurrency)
    {
        return new BillingAccount(tenantId, currency, DateTime.UtcNow);
    }

    public Result TopUp(decimal amount, string reference)
    {
        if (amount <= 0)
            return Result.Failure(BillingDomainErrors.InvalidTopUpAmount);

        Balance += amount;
        LifetimeToppedUp += amount;

        if (LowBalanceThreshold.HasValue && Balance > LowBalanceThreshold.Value)
            LowBalanceAlertSentForCurrentDip = false;

        RaiseDomainEvent(new BalanceToppedUpDomainEvent(Id, TenantId, amount, Balance, reference));

        return Result.Success();
    }

    public Result<Reservation> Reserve(decimal estimate, DateTime nowUtc)
    {
        if (estimate <= 0)
            return Result.Failure<Reservation>(BillingDomainErrors.InvalidReservationAmount);

        RollMonthIfNeeded(nowUtc);

        if (Balance < estimate)
            return Result.Failure<Reservation>(BillingDomainErrors.InsufficientFunds);

        if (MonthlyHardCap.HasValue && MonthSpent + estimate > MonthlyHardCap.Value)
            return Result.Failure<Reservation>(BillingDomainErrors.MonthlyCapReached);

        var reservation = Reservation.Create(Id, estimate, nowUtc);
        _reservations.Add(reservation);
        Balance -= estimate;

        return reservation;
    }

    public Result CommitReservation(Guid reservationId, decimal actualCost, DateTime nowUtc)
    {
        var reservation = _reservations.FirstOrDefault(r => r.Id == reservationId);
        if (reservation is null || reservation.Status != ReservationStatus.Pending)
            return Result.Failure(BillingDomainErrors.ReservationNotFound);

        if (actualCost < 0)
            return Result.Failure(BillingDomainErrors.InvalidReservationAmount);

        var charged = Math.Min(actualCost, reservation.Amount);
        var refundDelta = reservation.Amount - charged;

        Balance += refundDelta;
        LifetimeSpent += charged;
        MonthSpent += charged;

        reservation.Commit(charged, nowUtc);

        CheckLowBalance();
        CheckMonthlyCap();

        return Result.Success();
    }

    public Result RefundReservation(Guid reservationId, DateTime nowUtc)
    {
        var reservation = _reservations.FirstOrDefault(r => r.Id == reservationId);
        if (reservation is null || reservation.Status != ReservationStatus.Pending)
            return Result.Failure(BillingDomainErrors.ReservationNotFound);

        Balance += reservation.Amount;
        reservation.Refund(nowUtc);

        return Result.Success();
    }

    public Result SetMonthlyCap(decimal? cap)
    {
        if (cap.HasValue && cap.Value < 0)
            return Result.Failure(BillingDomainErrors.InvalidCapAmount);

        MonthlyHardCap = cap;
        return Result.Success();
    }

    public Result SetLowBalanceThreshold(decimal? threshold)
    {
        if (threshold.HasValue && threshold.Value < 0)
            return Result.Failure(BillingDomainErrors.InvalidThresholdAmount);

        LowBalanceThreshold = threshold;
        return Result.Success();
    }

    public void AssignPricingPlan(Guid? pricingPlanId)
    {
        CurrentPricingPlanId = pricingPlanId;
    }

    public void RollMonthIfNeeded(DateTime nowUtc)
    {
        var currentAnchor = MonthAnchor(nowUtc);
        if (currentAnchor > MonthAnchorUtc)
        {
            MonthAnchorUtc = currentAnchor;
            MonthSpent = 0m;
        }
    }

    private static DateTime MonthAnchor(DateTime utc) =>
        new(utc.Year, utc.Month, 1, 0, 0, 0, DateTimeKind.Utc);

    private void CheckLowBalance()
    {
        if (LowBalanceThreshold.HasValue
            && Balance <= LowBalanceThreshold.Value
            && !LowBalanceAlertSentForCurrentDip)
        {
            LowBalanceAlertSentForCurrentDip = true;
            RaiseDomainEvent(new LowBalanceReachedDomainEvent(
                Id,
                TenantId,
                Balance,
                LowBalanceThreshold.Value));
        }

        if (Balance <= 0)
        {
            RaiseDomainEvent(new BalanceExhaustedDomainEvent(Id, TenantId));
        }
    }

    private void CheckMonthlyCap()
    {
        if (MonthlyHardCap.HasValue && MonthSpent >= MonthlyHardCap.Value)
        {
            RaiseDomainEvent(new MonthlyCapReachedDomainEvent(
                Id,
                TenantId,
                MonthlyHardCap.Value,
                MonthSpent));
        }
    }
}
