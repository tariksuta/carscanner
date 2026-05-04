using CarScanner.Application.Abstraction.Authorization;
using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.SharedKernel.Authorization;
using Microsoft.Extensions.Caching.Memory;

namespace CarScanner.Infrastructure.Authorization;

public sealed class PricingPlanFeatureService : IFeatureService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    private readonly ITenantProvider _tenantProvider;
    private readonly IBillingAccountRepository _billingAccountRepository;
    private readonly IPricingPlanRepository _pricingPlanRepository;
    private readonly IMemoryCache _cache;

    public PricingPlanFeatureService(
        ITenantProvider tenantProvider,
        IBillingAccountRepository billingAccountRepository,
        IPricingPlanRepository pricingPlanRepository,
        IMemoryCache cache)
    {
        _tenantProvider = tenantProvider;
        _billingAccountRepository = billingAccountRepository;
        _pricingPlanRepository = pricingPlanRepository;
        _cache = cache;
    }

    public async Task<bool> IsModuleEnabledAsync(Module module, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId == Guid.Empty)
            return false;

        var enabledModules = await GetEnabledModulesAsync(tenantId, cancellationToken);
        return enabledModules.Contains(module);
    }

    private async Task<IReadOnlySet<Module>> GetEnabledModulesAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKey(tenantId);
        if (_cache.TryGetValue<IReadOnlySet<Module>>(cacheKey, out var cached) && cached is not null)
            return cached;

        var billingAccount = await _billingAccountRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var pricingPlan = billingAccount?.CurrentPricingPlanId is { } planId
            ? await _pricingPlanRepository.GetByIdAsync(planId, cancellationToken)
            : null;

        IReadOnlySet<Module> modules = pricingPlan is not null
            ? pricingPlan.EnabledModules.ToHashSet()
            : new HashSet<Module>(Enum.GetValues<Module>().Where(m => m != Module.PlatformTenants));

        _cache.Set(cacheKey, modules, CacheTtl);
        return modules;
    }

    private static string CacheKey(Guid tenantId) => $"feature_modules:{tenantId:N}";
}
