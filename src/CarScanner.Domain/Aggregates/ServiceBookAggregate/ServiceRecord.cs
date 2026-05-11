using CarScanner.Domain.Aggregates.ServiceBookAggregate.Errors;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Events;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.ValueObjects;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Interfaces;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ServiceBookAggregate;

public sealed class ServiceRecord : AggregateRoot, ITenantEntity
{
    public const int MaxDescriptionLength = 1000;
    public const int MaxWorkshopNameLength = 200;
    public const int MaxWorkshopContactLength = 200;
    public const int MaxDocuments = 10;
    public const int MaxCurrencyLength = 3;
    public const string DefaultCurrency = "BAM";

    private readonly List<ServiceDocument> _documents = [];

    public Guid TenantId { get; set; }
    public Guid VehicleId { get; private set; }
    public DateOnly ServiceDate { get; private set; }
    public int MileageAtService { get; private set; }
    public ServiceRecordType Type { get; private set; }
    public decimal Cost { get; private set; }
    public string Currency { get; private set; } = DefaultCurrency;
    public string Description { get; private set; } = string.Empty;
    public string? WorkshopName { get; private set; }
    public string? WorkshopContact { get; private set; }
    public Guid? CreatedByEmployeeId { get; private set; }

    public IReadOnlyCollection<ServiceDocument> Documents => _documents.AsReadOnly();

    private ServiceRecord() { }

    private ServiceRecord(
        Guid tenantId,
        Guid vehicleId,
        DateOnly serviceDate,
        int mileageAtService,
        ServiceRecordType type,
        decimal cost,
        string currency,
        string description,
        string? workshopName,
        string? workshopContact,
        Guid? createdByEmployeeId) : base()
    {
        TenantId = tenantId;
        VehicleId = vehicleId;
        ServiceDate = serviceDate;
        MileageAtService = mileageAtService;
        Type = type;
        Cost = cost;
        Currency = currency;
        Description = description;
        WorkshopName = workshopName;
        WorkshopContact = workshopContact;
        CreatedByEmployeeId = createdByEmployeeId;

        RaiseDomainEvent(new ServiceRecordCreatedDomainEvent(
            Id, tenantId, vehicleId, serviceDate, mileageAtService, type));
    }

    public static Result<ServiceRecord> Create(
        Guid tenantId,
        Guid vehicleId,
        DateOnly serviceDate,
        int mileageAtService,
        ServiceRecordType type,
        decimal cost,
        string? currency,
        string? description,
        string? workshopName,
        string? workshopContact,
        Guid? createdByEmployeeId,
        DateOnly today)
    {
        if (vehicleId == Guid.Empty)
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.InvalidVehicleId);

        if (serviceDate > today)
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.InvalidServiceDate);

        if (mileageAtService < 0)
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.InvalidMileage);

        if (cost < 0)
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.InvalidCost);

        var trimmedDescription = description?.Trim() ?? string.Empty;
        if (trimmedDescription.Length > MaxDescriptionLength)
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.DescriptionTooLong);

        var trimmedWorkshopName = workshopName?.Trim();
        if (trimmedWorkshopName is { Length: > MaxWorkshopNameLength })
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.WorkshopNameTooLong);

        var trimmedWorkshopContact = workshopContact?.Trim();
        if (trimmedWorkshopContact is { Length: > MaxWorkshopContactLength })
            return Result.Failure<ServiceRecord>(ServiceBookDomainErrors.WorkshopContactTooLong);

        var resolvedCurrency = string.IsNullOrWhiteSpace(currency)
            ? DefaultCurrency
            : currency.Trim().ToUpperInvariant();

        return new ServiceRecord(
            tenantId,
            vehicleId,
            serviceDate,
            mileageAtService,
            type,
            cost,
            resolvedCurrency,
            trimmedDescription,
            string.IsNullOrEmpty(trimmedWorkshopName) ? null : trimmedWorkshopName,
            string.IsNullOrEmpty(trimmedWorkshopContact) ? null : trimmedWorkshopContact,
            createdByEmployeeId);
    }

    public Result Update(
        DateOnly serviceDate,
        int mileageAtService,
        ServiceRecordType type,
        decimal cost,
        string? currency,
        string? description,
        string? workshopName,
        string? workshopContact,
        DateOnly today)
    {
        if (serviceDate > today)
            return Result.Failure(ServiceBookDomainErrors.InvalidServiceDate);

        if (mileageAtService < 0)
            return Result.Failure(ServiceBookDomainErrors.InvalidMileage);

        if (cost < 0)
            return Result.Failure(ServiceBookDomainErrors.InvalidCost);

        var trimmedDescription = description?.Trim() ?? string.Empty;
        if (trimmedDescription.Length > MaxDescriptionLength)
            return Result.Failure(ServiceBookDomainErrors.DescriptionTooLong);

        var trimmedWorkshopName = workshopName?.Trim();
        if (trimmedWorkshopName is { Length: > MaxWorkshopNameLength })
            return Result.Failure(ServiceBookDomainErrors.WorkshopNameTooLong);

        var trimmedWorkshopContact = workshopContact?.Trim();
        if (trimmedWorkshopContact is { Length: > MaxWorkshopContactLength })
            return Result.Failure(ServiceBookDomainErrors.WorkshopContactTooLong);

        ServiceDate = serviceDate;
        MileageAtService = mileageAtService;
        Type = type;
        Cost = cost;
        Currency = string.IsNullOrWhiteSpace(currency) ? Currency : currency.Trim().ToUpperInvariant();
        Description = trimmedDescription;
        WorkshopName = string.IsNullOrEmpty(trimmedWorkshopName) ? null : trimmedWorkshopName;
        WorkshopContact = string.IsNullOrEmpty(trimmedWorkshopContact) ? null : trimmedWorkshopContact;

        return Result.Success();
    }

    public Result AddDocument(string url, string fileName, string contentType, DateTime uploadedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(url))
            return Result.Failure(ServiceBookDomainErrors.InvalidDocumentUrl);

        if (_documents.Count >= MaxDocuments)
            return Result.Failure(ServiceBookDomainErrors.MaxDocumentsReached);

        _documents.Add(new ServiceDocument(url, fileName, contentType, uploadedAtUtc));
        return Result.Success();
    }

    public Result RemoveDocument(string url)
    {
        var document = _documents.FirstOrDefault(d => d.Url == url);
        if (document is null)
            return Result.Success();

        _documents.Remove(document);
        return Result.Success();
    }
}
