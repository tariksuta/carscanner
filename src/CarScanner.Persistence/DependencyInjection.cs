using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.Domain.Aggregates.BillingAggregate.Repository;
using CarScanner.Domain.Aggregates.BillingAggregate.Services;
using CarScanner.Domain.Aggregates.BranchAggregate.Repository;
using CarScanner.Domain.Aggregates.ClientAggregate.Repository;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.RentalAggregate.Repository;
using CarScanner.Domain.Aggregates.ServiceBookAggregate.Repository;
using CarScanner.Domain.Aggregates.TenantAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Persistence.Repositories;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarScanner.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options
                .EnableSensitiveDataLogging()
                .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
                .UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(3);
                }));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IBranchRepository, BranchRepository>();
        services.AddScoped<IRentalRepository, RentalRepository>();
        services.AddScoped<IVehicleInspectionRepository, VehicleInspectionRepository>();
        services.AddScoped<IDamageReportRepository, DamageReportRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IBillingAccountRepository, BillingAccountRepository>();
        services.AddScoped<IPricingPlanRepository, PricingPlanRepository>();
        services.AddScoped<IAiUsageRecordRepository, AiUsageRecordRepository>();
        services.AddScoped<IServiceRecordRepository, ServiceRecordRepository>();

        services.AddSingleton<IPricingCalculator, PricingCalculator>();

        return services;
    }
}
