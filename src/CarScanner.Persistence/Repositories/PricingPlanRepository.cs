using CarScanner.Domain.Aggregates.BillingAggregate;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence.Repositories;

public sealed class PricingPlanRepository(ApplicationDbContext dbContext)
    : Repository<PricingPlan, Guid>(dbContext), IPricingPlanRepository
{
    public async Task<PricingPlan?> GetDefaultAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(p => p.IsDefault && p.EffectiveUntilUtc == null, cancellationToken);
    }

    public async Task<IReadOnlyList<PricingPlan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .OrderByDescending(p => p.IsDefault)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
}
