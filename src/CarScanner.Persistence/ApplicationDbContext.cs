using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Entities;
using CarScanner.Domain.Aggregates.ClientAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Entities;
using CarScanner.Domain.Aggregates.EmployeeAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate;
using CarScanner.Domain.Aggregates.InspectionAggregate.Entities;
using CarScanner.Domain.Aggregates.RentalAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate;
using CarScanner.Domain.Aggregates.VehicleAggregate.Entities;
using CarScanner.SharedKernel.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarScanner.Persistence;

public class ApplicationDbContext : DbContext
{
    private readonly ITenantProvider? _tenantProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();
    public DbSet<ApplicationUserToken> ApplicationUserTokens => Set<ApplicationUserToken>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Rental> Rentals => Set<Rental>();
    public DbSet<VehicleInspection> VehicleInspections => Set<VehicleInspection>();
    public DbSet<InspectionPhoto> InspectionPhotos => Set<InspectionPhoto>();
    public DbSet<VehicleImage> VehicleImages => Set<VehicleImage>();
    public DbSet<DamageReport> DamageReports => Set<DamageReport>();
    public DbSet<DamageItem> DamageItems => Set<DamageItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        if (_tenantProvider is not null)
        {
            modelBuilder.Entity<Vehicle>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
            modelBuilder.Entity<Client>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
            modelBuilder.Entity<Employee>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
            modelBuilder.Entity<Rental>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
            modelBuilder.Entity<VehicleInspection>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
            modelBuilder.Entity<DamageReport>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId && !e.IsDeleted);
        }

        base.OnModelCreating(modelBuilder);
    }
}
