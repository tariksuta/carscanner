using CarScanner.Domain.Aggregates.RentalAggregate.Errors;
using CarScanner.Domain.Aggregates.RentalAggregate.Events;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.RentalAggregate;

public sealed class Rental : AggregateRoot, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid? PickupEmployeeId { get; private set; }
    public Guid? ReturnEmployeeId { get; private set; }
    public Guid? PickupInspectionId { get; private set; }
    public Guid? ReturnInspectionId { get; private set; }
    public DateTime? PickupDate { get; private set; }
    public DateTime ExpectedReturnDate { get; private set; }
    public DateTime? ActualReturnDate { get; private set; }
    public int? PickupMileage { get; private set; }
    public int? ReturnMileage { get; private set; }
    public decimal Price { get; private set; }
    public RentalStatus Status { get; private set; }
    public string? Notes { get; private set; }

    private Rental() { }

    private Rental(
        Guid vehicleId,
        Guid clientId,
        DateTime expectedReturnDate,
        decimal price,
        string? notes) : base()
    {
        VehicleId = vehicleId;
        ClientId = clientId;
        ExpectedReturnDate = expectedReturnDate;
        Price = price;
        Notes = notes;
        Status = RentalStatus.Pending;
    }

    public static Result<Rental> Create(
        Guid vehicleId,
        Guid clientId,
        DateTime expectedReturnDate,
        decimal price,
        string? notes = null)
    {
        if (expectedReturnDate <= DateTime.UtcNow)
            return Result.Failure<Rental>(RentalDomainErrors.InvalidReturnDate);

        if (price < 0)
            return Result.Failure<Rental>(RentalDomainErrors.InvalidPrice);

        var rental = new Rental(vehicleId, clientId, expectedReturnDate, price, notes);
        rental.RaiseDomainEvent(new RentalCreatedDomainEvent(rental.Id, vehicleId, clientId));

        return rental;
    }

    public Result StartPickupInspection(Guid employeeId)
    {
        if (Status != RentalStatus.Pending)
            return Result.Failure(RentalDomainErrors.AlreadyStarted);

        PickupEmployeeId = employeeId;
        Status = RentalStatus.PickupInProgress;

        return Result.Success();
    }

    public Result CompletePickup(Guid inspectionId, int mileage)
    {
        if (Status != RentalStatus.PickupInProgress)
            return Result.Failure(RentalDomainErrors.NotStarted);

        PickupInspectionId = inspectionId;
        PickupDate = DateTime.UtcNow;
        PickupMileage = mileage;
        Status = RentalStatus.Active;

        RaiseDomainEvent(new RentalStartedDomainEvent(Id, VehicleId, ClientId, inspectionId));

        return Result.Success();
    }

    public Result StartReturnInspection(Guid employeeId)
    {
        if (Status != RentalStatus.Active)
            return Result.Failure(RentalDomainErrors.NotStarted);

        ReturnEmployeeId = employeeId;
        Status = RentalStatus.ReturnInProgress;

        return Result.Success();
    }

    public Result CompleteReturn(Guid inspectionId, int mileage)
    {
        if (Status != RentalStatus.ReturnInProgress)
            return Result.Failure(RentalDomainErrors.ReturnInspectionRequired);

        if (PickupInspectionId is null)
            return Result.Failure(RentalDomainErrors.PickupInspectionRequired);

        ReturnInspectionId = inspectionId;
        ActualReturnDate = DateTime.UtcNow;
        ReturnMileage = mileage;
        Status = RentalStatus.Completed;

        RaiseDomainEvent(new RentalCompletedDomainEvent(
            Id,
            VehicleId,
            ClientId,
            PickupInspectionId.Value,
            inspectionId));

        return Result.Success();
    }

    public Result Cancel()
    {
        if (Status == RentalStatus.Completed)
            return Result.Failure(RentalDomainErrors.AlreadyCompleted);

        if (Status == RentalStatus.Cancelled)
            return Result.Failure(RentalDomainErrors.AlreadyCancelled);

        if (Status == RentalStatus.Active || Status == RentalStatus.ReturnInProgress)
            return Result.Failure(RentalDomainErrors.CannotCancel);

        Status = RentalStatus.Cancelled;
        return Result.Success();
    }

    public void AddNote(string note)
    {
        Notes = string.IsNullOrWhiteSpace(Notes)
            ? note
            : $"{Notes}\n{note}";
    }
}
