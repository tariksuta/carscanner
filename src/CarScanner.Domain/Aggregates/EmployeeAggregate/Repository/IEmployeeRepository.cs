using CarScanner.SharedKernel.Interfaces;

namespace CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;

public interface IEmployeeRepository : IRepository<Employee, Guid>
{
    Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Employee>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}
