using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.BillingAggregate.Repository;

public interface IPricingPlanRepository : IRepository<PricingPlan, Guid>
{
    Task<PricingPlan?> GetDefaultAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PricingPlan>> GetAllAsync(CancellationToken cancellationToken = default);
}
