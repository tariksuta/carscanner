using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Entities;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.ValueObjects;
using CarScanner.SharedKernel.Primitives;
using System.Text.RegularExpressions;

namespace CarScanner.Domain.Aggregates.ApplicationUserAggregate;

public sealed partial class ApplicationUser : AggregateRoot
{
    public string Email { get; private set; } = null!;
    public string NormalizedEmail { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string? Role { get; private set; }
    public Address? Address { get; private set; }
    public string? ProfileImageUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastSignInOnUtc { get; private set; }

    private readonly List<ApplicationUserToken> _tokens = [];
    public IReadOnlyCollection<ApplicationUserToken> Tokens => _tokens.AsReadOnly();

    private ApplicationUser() { }

    private ApplicationUser(
        string email,
        string passwordHash,
        string? firstName,
        string? lastName,
        string? role) : base()
    {
        Email = email.ToLowerInvariant();
        NormalizedEmail = email.ToUpperInvariant();
        PasswordHash = passwordHash;
        FirstName = firstName?.Trim();
        LastName = lastName?.Trim();
        Role = role?.Trim();
        IsActive = true;
    }

    public static Result<ApplicationUser> Create(
        string email,
        string passwordHash,
        string? firstName = null,
        string? lastName = null,
        string? role = null)
    {
        if (string.IsNullOrWhiteSpace(email) || !EmailRegex().IsMatch(email))
            return Result.Failure<ApplicationUser>(ApplicationUserDomainErrors.InvalidEmail);

        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result.Failure<ApplicationUser>(ApplicationUserDomainErrors.InvalidPassword);

        return new ApplicationUser(email.Trim(), passwordHash, firstName, lastName, role);
    }

    public Result Login(string refreshToken, DateTime expiresOnUtc)
    {
        if (!IsActive)
            return Result.Failure(ApplicationUserDomainErrors.AccountInactive);

        // Remove old refresh tokens
        _tokens.RemoveAll(t => t.TokenType == TokenTypes.RefreshToken);

        // Add new refresh token
        _tokens.Add(ApplicationUserToken.CreateRefreshToken(refreshToken, expiresOnUtc));

        LastSignInOnUtc = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RefreshAuthentication(string oldToken, string newToken, DateTime expiresOnUtc)
    {
        if (!IsActive)
            return Result.Failure(ApplicationUserDomainErrors.AccountInactive);

        var token = _tokens.FirstOrDefault(t =>
            t.Token == oldToken &&
            t.TokenType == TokenTypes.RefreshToken);

        if (token is null)
            return Result.Failure(ApplicationUserDomainErrors.TokenNotFound);

        if (!token.IsValid)
            return Result.Failure(ApplicationUserDomainErrors.TokenInvalid);

        if (token.IsExpired)
            return Result.Failure(ApplicationUserDomainErrors.TokenExpired);

        if (token.IsUsed)
            return Result.Failure(ApplicationUserDomainErrors.TokenAlreadyUsed);

        token.Extend(newToken, expiresOnUtc);
        LastSignInOnUtc = DateTime.UtcNow;

        return Result.Success();
    }

    public void Logout()
    {
        _tokens.RemoveAll(t => t.TokenType == TokenTypes.RefreshToken);
    }

    public Result ForgotPassword(string resetToken, DateTime expiresOnUtc)
    {
        if (!IsActive)
            return Result.Failure(ApplicationUserDomainErrors.AccountInactive);

        // Remove old reset password tokens
        _tokens.RemoveAll(t => t.TokenType == TokenTypes.ResetPassword);

        // Add new reset password token
        _tokens.Add(ApplicationUserToken.CreateResetPasswordToken(resetToken, expiresOnUtc));

        return Result.Success();
    }

    public Result ResetPassword(string resetToken, string newPasswordHash)
    {
        var token = _tokens.FirstOrDefault(t =>
            t.Token == resetToken &&
            t.TokenType == TokenTypes.ResetPassword &&
            t.IsValid &&
            !t.IsExpired);

        if (token is null)
            return Result.Failure(ApplicationUserDomainErrors.TokenInvalid);

        token.Use(DateTime.UtcNow);
        PasswordHash = newPasswordHash;

        // Remove all reset password tokens after successful reset
        _tokens.RemoveAll(t => t.TokenType == TokenTypes.ResetPassword);

        return Result.Success();
    }

    public Result UpdatePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            return Result.Failure(ApplicationUserDomainErrors.InvalidPassword);

        PasswordHash = newPasswordHash;
        return Result.Success();
    }

    public Result UpdateProfile(string? firstName, string? lastName, Address? address)
    {
        if (firstName is not null && firstName.Trim().Length > 100)
            return Result.Failure(ApplicationUserDomainErrors.FirstNameTooLong);

        if (lastName is not null && lastName.Trim().Length > 100)
            return Result.Failure(ApplicationUserDomainErrors.LastNameTooLong);

        FirstName = firstName?.Trim();
        LastName = lastName?.Trim();
        Address = address;
        return Result.Success();
    }

    public void SetProfileImage(string imageUrl)
    {
        ProfileImageUrl = imageUrl;
    }

    public void RemoveProfileImage()
    {
        ProfileImageUrl = null;
    }

    public void Activate() => IsActive = true;

    public void Deactivate()
    {
        IsActive = false;
        _tokens.Clear();
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase)]
    private static partial Regex EmailRegex();
}
