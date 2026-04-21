namespace CarScanner.SharedKernel.Interfaces;

public interface IAuditableEntity
{
    Guid CreatedBy { get; set; }
    DateTime CreatedOnUtc { get; set; }
    Guid? ModifiedBy { get; set; }
    DateTime? ModifiedOnUtc { get; set; }
    bool IsDeleted { get; set; }
    Guid? DeletedBy { get; set; }
    DateTime? DeletedOnUtc { get; set; }
}
