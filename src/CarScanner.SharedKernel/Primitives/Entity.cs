using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.SharedKernel.Primitives;

public abstract class Entity<TKey> : IEntity<TKey>, IEquatable<Entity<TKey>>
{
    public TKey Id { get; protected set; } = default!;
    public byte[] RowVersion { get; set; } = [];

    protected Entity() { }

    protected Entity(TKey id)
    {
        Id = id;
    }

    public bool Equals(Entity<TKey>? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return EqualityComparer<TKey>.Default.Equals(Id, other.Id);
    }

    public override bool Equals(object? obj)
    {
        return obj is Entity<TKey> entity && Equals(entity);
    }

    public override int GetHashCode()
    {
        return EqualityComparer<TKey>.Default.GetHashCode(Id!);
    }

    public static bool operator ==(Entity<TKey>? left, Entity<TKey>? right)
    {
        return Equals(left, right);
    }

    public static bool operator !=(Entity<TKey>? left, Entity<TKey>? right)
    {
        return !Equals(left, right);
    }
}
