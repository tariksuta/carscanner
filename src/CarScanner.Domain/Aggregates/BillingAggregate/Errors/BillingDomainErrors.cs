using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Errors;

public static class BillingDomainErrors
{
    public static DomainError NotFound(Guid id) =>
        DomainError.NotFound("BillingAccount", id);

    public static DomainError NotFoundForTenant(Guid tenantId) =>
        new("BillingAccount.NotFoundForTenant", $"No billing account is provisioned for tenant '{tenantId}'.");

    public static readonly DomainError InvalidTopUpAmount =
        DomainError.Validation("Billing.InvalidTopUpAmount", "Top-up amount must be greater than zero.");

    public static readonly DomainError InvalidReservationAmount =
        DomainError.Validation("Billing.InvalidReservationAmount", "Reservation amount must be greater than zero.");

    public static readonly DomainError InvalidCapAmount =
        DomainError.Validation("Billing.InvalidCapAmount", "Monthly cap cannot be negative.");

    public static readonly DomainError InvalidThresholdAmount =
        DomainError.Validation("Billing.InvalidThresholdAmount", "Low-balance threshold cannot be negative.");

    public static readonly DomainError InsufficientFunds =
        new("Billing.InsufficientFunds", "Insufficient balance to reserve the requested amount.");

    public static readonly DomainError MonthlyCapReached =
        new("Billing.MonthlyCapReached", "Reservation would exceed the configured monthly cap.");

    public static readonly DomainError ReservationNotFound =
        new("Billing.ReservationNotFound", "Reservation was not found or is not in a pending state.");
}
