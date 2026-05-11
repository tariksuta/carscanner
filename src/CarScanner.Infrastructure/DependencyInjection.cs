using Azure.Storage.Blobs;
using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.Authorization;
using CarScanner.Application.Abstraction.Billing;
using CarScanner.Application.Abstraction.Imaging;
using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Application.Abstraction.Storage;
using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;
using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Application.Abstraction.UserPrincipal;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Infrastructure.AI;
using CarScanner.Infrastructure.Authorization;
using CarScanner.Infrastructure.Billing;
using CarScanner.Infrastructure.Billing.BackgroundJobs;
using CarScanner.Infrastructure.Identity;
using CarScanner.Infrastructure.IdentityServices;
using CarScanner.Infrastructure.Imaging;
using CarScanner.Infrastructure.Notifications;
using CarScanner.Infrastructure.ServiceBook.BackgroundJobs;
using CarScanner.Infrastructure.Storage;
using CarScanner.Infrastructure.Tenant;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CarScanner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<ITenantProvider, JwtClaimTenantProvider>();
        services.AddScoped<IUserPrincipal, HttpContextUserPrincipal>();

        services.AddSingleton(_ =>
            new BlobServiceClient(configuration.GetConnectionString("AzureBlobStorage")));

        services.AddScoped<IFileStorageService, AzureBlobStorageService>();

        services
            .AddOptions<ImageProcessingOptions>()
            .BindConfiguration(ImageProcessingOptions.SectionName);
        services.AddSingleton<IImageProcessingService, ImageSharpImageProcessor>();

        services.AddEmailNotifications(configuration);

		services.AddTokenGenerators(configuration);

        services.AddScoped<MockVehicleDamageAnalyzer>();

        var useRealAI = configuration.GetSection("OpenAI:Enabled").Value == "true";
        if (useRealAI)
        {
            services.AddHttpClient<OpenAIVehicleDamageAnalyzer>();
        }

        services.AddScoped<IVehicleDamageAnalyzer>(sp =>
        {
            IVehicleDamageAnalyzer inner = useRealAI
                ? sp.GetRequiredService<OpenAIVehicleDamageAnalyzer>()
                : sp.GetRequiredService<MockVehicleDamageAnalyzer>();

            return new BillingAwareVehicleDamageAnalyzer(
                inner,
                sp.GetRequiredService<IBillingService>(),
                sp.GetRequiredService<IConfiguration>(),
                sp.GetRequiredService<ILogger<BillingAwareVehicleDamageAnalyzer>>());
        });

        services.AddScoped<IBillingService, BillingService>();

        services.AddHostedService<BillingMaintenanceHostedService>();
        services.AddHostedService<MaintenanceReminderHostedService>();

        services.AddMemoryCache();
        services.AddScoped<IFeatureService, PricingPlanFeatureService>();

        return services;
    }

    private static IServiceCollection AddEmailNotifications(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<EmailOptions>()
            .BindConfiguration(EmailOptions.SectionName);

        var provider = configuration[$"{EmailOptions.SectionName}:Provider"];
        if (string.Equals(provider, "Smtp", StringComparison.OrdinalIgnoreCase))
        {
            services.AddScoped<IEmailNotificationService, SmtpEmailNotificationService>();
        }
        else
        {
            services.AddScoped<IEmailNotificationService, ConsoleEmailNotificationService>();
        }

        return services;
    }

    private static IServiceCollection AddTokenGenerators(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<AccessTokenOptions>()
            .BindConfiguration("TokenOptions:AccessTokenOptions")
            .ValidateOnStart();

        services
            .AddOptions<RefreshTokenOptions>()
            .BindConfiguration("TokenOptions:RefreshTokenOptions")
            .ValidateOnStart();

        services.AddDataProtection();

        services.AddScoped<IAccessTokenGenerator, AccessTokenGenerator>();
        services.AddScoped<IRefreshTokenGenerator, RefreshTokenGenerator>();

        return services;
    }
}
