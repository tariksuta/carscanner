using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Domain.Aggregates.ApplicationUserAggregate.Entities;

public sealed class ApplicationUserToken : Entity<Guid>
{
    public string Token { get; private set; } = null!;
    public string TokenType { get; private set; } = null!;
    public DateTime? ExpiresOnUtc { get; private set; }
    public DateTime? UsedOnUtc { get; private set; }
    public bool IsValid { get; private set; }

    public Guid ApplicationUserId { get; private set; }
    public ApplicationUser ApplicationUser { get; private set; } = null!;

    internal bool IsExpired => ExpiresOnUtc.HasValue && DateTime.UtcNow > ExpiresOnUtc;
    internal bool IsUsed => UsedOnUtc.HasValue;

    private ApplicationUserToken() { }

    private ApplicationUserToken(
        string token,
        string tokenType,
        DateTime? expiresOnUtc)
    {
        Token = token;
        TokenType = tokenType;
        ExpiresOnUtc = expiresOnUtc;
        IsValid = true;
    }

    public void Use(DateTime usedOnUtc)
    {
        UsedOnUtc = usedOnUtc;
        IsValid = false;
    }

    internal void Extend(string token, DateTime? expiresOnUtc)
    {
        Token = token;
        ExpiresOnUtc = expiresOnUtc;
        IsValid = true;
        UsedOnUtc = null;
    }

    internal static ApplicationUserToken CreateRefreshToken(string token, DateTime expiresOnUtc)
        => new(token, TokenTypes.RefreshToken, expiresOnUtc);

    internal static ApplicationUserToken CreateResetPasswordToken(string token, DateTime expiresOnUtc)
        => new(token, TokenTypes.ResetPassword, expiresOnUtc);
}
