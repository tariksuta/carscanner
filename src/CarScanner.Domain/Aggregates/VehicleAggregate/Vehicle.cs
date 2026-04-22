using CarScanner.Domain.Aggregates.VehicleAggregate.Entities;
using CarScanner.Domain.Aggregates.VehicleAggregate.Errors;
using CarScanner.Domain.Aggregates.VehicleAggregate.ValueObjects;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.VehicleAggregate;

public sealed class Vehicle : AggregateRoot, ITenantEntity
{
    private readonly List<VehicleImage> _images = [];

    public Guid TenantId { get; set; }
    public string Brand { get; private set; } = null!;
    public string Model { get; private set; } = null!;
    public int Year { get; private set; }
    public LicensePlate LicensePlate { get; private set; } = null!;
    public string Vin { get; private set; } = null!;
    public string Color { get; private set; } = null!;
    public int CurrentMileage { get; private set; }
    public VehicleStatus Status { get; private set; }
    public FuelType Fuel { get; private set; }
    public GearType Gear { get; private set; }
    public int? PowerKw { get; private set; }
    public int Seats { get; private set; }
    public DateOnly? RegistrationExpiry { get; private set; }
    public DateOnly? InsuranceExpiry { get; private set; }

    public IReadOnlyCollection<VehicleImage> Images => _images.AsReadOnly();

    private Vehicle() { }

    private Vehicle(
        string brand,
        string model,
        int year,
        LicensePlate licensePlate,
        string vin,
        string color,
        int currentMileage,
        FuelType fuel,
        GearType gear,
        int? powerKw,
        int seats,
        DateOnly? registrationExpiry,
        DateOnly? insuranceExpiry) : base()
    {
        Brand = brand;
        Model = model;
        Year = year;
        LicensePlate = licensePlate;
        Vin = vin;
        Color = color;
        CurrentMileage = currentMileage;
        Status = VehicleStatus.Available;
        Fuel = fuel;
        Gear = gear;
        PowerKw = powerKw;
        Seats = seats;
        RegistrationExpiry = registrationExpiry;
        InsuranceExpiry = insuranceExpiry;
    }

    public static Result<Vehicle> Create(
        string brand,
        string model,
        int year,
        string licensePlate,
        string vin,
        string color,
        int currentMileage,
        FuelType fuel,
        GearType gear,
        int? powerKw,
        int seats,
        DateOnly? registrationExpiry,
        DateOnly? insuranceExpiry)
    {
        if (string.IsNullOrWhiteSpace(brand))
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidBrand);

        if (string.IsNullOrWhiteSpace(model))
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidModel);

        if (year < 1900 || year > DateTime.UtcNow.Year + 1)
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidYear);

        var licensePlateResult = LicensePlate.Create(licensePlate);
        if (licensePlateResult.IsFailure)
            return Result.Failure<Vehicle>(licensePlateResult.Error);

        if (string.IsNullOrWhiteSpace(vin) || vin.Length != 17)
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidVin);

        if (powerKw.HasValue && powerKw.Value <= 0)
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidPowerKw);

        if (seats < 1 || seats > 9)
            return Result.Failure<Vehicle>(VehicleDomainErrors.InvalidSeats);

        return new Vehicle(
            brand.Trim(),
            model.Trim(),
            year,
            licensePlateResult.Value,
            vin.ToUpperInvariant(),
            color?.Trim() ?? string.Empty,
            currentMileage,
            fuel,
            gear,
            powerKw,
            seats,
            registrationExpiry,
            insuranceExpiry);
    }

    public Result AddImage(string imageUrl, bool isPrimary)
    {
        if (_images.Count >= 10)
            return Result.Failure(VehicleDomainErrors.MaxImagesReached);

        if (string.IsNullOrWhiteSpace(imageUrl))
            return Result.Failure(VehicleDomainErrors.InvalidImageUrl);

        if (isPrimary)
        {
            foreach (var img in _images)
                img.SetAsPrimary(false);
        }

        if (_images.Count == 0)
            isPrimary = true;

        var displayOrder = _images.Count;
        _images.Add(new VehicleImage(Id, imageUrl, isPrimary, displayOrder));

        return Result.Success();
    }

    public Result RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image is null)
            return Result.Failure(VehicleDomainErrors.ImageNotFound(imageId));

        var wasPrimary = image.IsPrimary;
        _images.Remove(image);

        if (wasPrimary && _images.Count > 0)
            _images[0].SetAsPrimary(true);

        for (int i = 0; i < _images.Count; i++)
            _images[i].UpdateDisplayOrder(i);

        return Result.Success();
    }

    public Result SetPrimaryImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image is null)
            return Result.Failure(VehicleDomainErrors.ImageNotFound(imageId));

        foreach (var img in _images)
            img.SetAsPrimary(false);

        image.SetAsPrimary(true);
        return Result.Success();
    }

    public VehicleImage? GetPrimaryImage()
    {
        return _images.FirstOrDefault(i => i.IsPrimary);
    }

    public Result MarkAsRented()
    {
        if (Status != VehicleStatus.Available)
            return Result.Failure(VehicleDomainErrors.NotAvailable);

        Status = VehicleStatus.Rented;
        return Result.Success();
    }

    public Result MarkAsAvailable(int newMileage)
    {
        if (Status != VehicleStatus.Rented)
            return Result.Failure(VehicleDomainErrors.InvalidStatusTransition);

        Status = VehicleStatus.Available;
        if (newMileage > CurrentMileage)
            CurrentMileage = newMileage;
        return Result.Success();
    }

    public void MarkAsInMaintenance()
    {
        Status = VehicleStatus.InMaintenance;
    }

    public void MarkAsOutOfService()
    {
        Status = VehicleStatus.OutOfService;
    }

    public void UpdateMileage(int mileage)
    {
        if (mileage > CurrentMileage)
            CurrentMileage = mileage;
    }

    public Result Update(
        string brand,
        string model,
        int year,
        string licensePlate,
        string color,
        FuelType fuel,
        GearType gear,
        int? powerKw,
        int seats,
        DateOnly? registrationExpiry,
        DateOnly? insuranceExpiry)
    {
        if (string.IsNullOrWhiteSpace(brand))
            return Result.Failure(VehicleDomainErrors.InvalidBrand);

        if (string.IsNullOrWhiteSpace(model))
            return Result.Failure(VehicleDomainErrors.InvalidModel);

        if (year < 1900 || year > DateTime.UtcNow.Year + 1)
            return Result.Failure(VehicleDomainErrors.InvalidYear);

        var licensePlateResult = LicensePlate.Create(licensePlate);
        if (licensePlateResult.IsFailure)
            return Result.Failure(licensePlateResult.Error);

        if (powerKw.HasValue && powerKw.Value <= 0)
            return Result.Failure(VehicleDomainErrors.InvalidPowerKw);

        if (seats < 1 || seats > 9)
            return Result.Failure(VehicleDomainErrors.InvalidSeats);

        Brand = brand.Trim();
        Model = model.Trim();
        Year = year;
        LicensePlate = licensePlateResult.Value;
        Color = color?.Trim() ?? string.Empty;
        Fuel = fuel;
        Gear = gear;
        PowerKw = powerKw;
        Seats = seats;
        RegistrationExpiry = registrationExpiry;
        InsuranceExpiry = insuranceExpiry;

        return Result.Success();
    }

    public Result ChangeStatus(VehicleStatus newStatus)
    {
        if (newStatus == Status)
            return Result.Success();

        if (newStatus == VehicleStatus.Rented || Status == VehicleStatus.Rented)
            return Result.Failure(VehicleDomainErrors.InvalidStatusTransition);

        Status = newStatus;
        return Result.Success();
    }
}
