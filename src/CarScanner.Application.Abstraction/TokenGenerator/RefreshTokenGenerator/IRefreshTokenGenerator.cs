using CarScanner.Domain.Aggregates.ApplicationUserAggregate;

namespace CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;

public interface IRefreshTokenGenerator
{
	ValueTask<RefreshToken> Generate(ApplicationUser user, CancellationToken cancellationToken = default);

	ValueTask<RefreshToken?> Parse(string token, CancellationToken cancellationToken = default);
}
