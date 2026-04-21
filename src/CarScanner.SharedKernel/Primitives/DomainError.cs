namespace CarScanner.SharedKernel.Primitives;

public sealed record DomainError(string Code, string Message)
{
    public static readonly DomainError None = new(string.Empty, string.Empty);
    public static readonly DomainError NullValue = new("Error.NullValue", "The specified result value is null.");

    public static DomainError NotFound(string entityName, object id) =>
        new($"{entityName}.NotFound", $"{entityName} with id '{id}' was not found.");

    public static DomainError Validation(string code, string message) =>
        new($"Validation.{code}", message);
}
