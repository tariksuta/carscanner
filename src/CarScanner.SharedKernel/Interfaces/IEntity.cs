namespace CarScanner.SharedKernel.Interfaces;

public interface IEntity<TKey>
{
    TKey Id { get; }
}
