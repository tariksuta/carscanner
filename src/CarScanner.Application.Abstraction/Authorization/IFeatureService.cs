using CarScanner.SharedKernel.Authorization;

namespace CarScanner.Application.Abstraction.Authorization;

public interface IFeatureService
{
    Task<bool> IsModuleEnabledAsync(Module module, CancellationToken cancellationToken = default);
}
