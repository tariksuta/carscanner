using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.SharedKernel.Primitives;

public abstract class AuditableEntity<TKey> : Entity<TKey>, IAuditableEntity
{
    public Guid CreatedBy { get; set; }
    public DateTime CreatedOnUtc { get; set; }
    public Guid? ModifiedBy { get; set; }
    public DateTime? ModifiedOnUtc { get; set; }
    public bool IsDeleted { get; set; }
    public Guid? DeletedBy { get; set; }
    public DateTime? DeletedOnUtc { get; set; }

    protected AuditableEntity() { }

    protected AuditableEntity(TKey id) : base(id) { }
}
