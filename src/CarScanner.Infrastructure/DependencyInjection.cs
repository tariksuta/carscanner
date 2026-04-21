using Azure.Storage.Blobs;
using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Application.Abstraction.Storage;
using CarScanner.Application.Abstraction.Tenant;
using CarScanner.Application.Abstraction.TokenGenerator.AccessTokenGenerator;
using CarScanner.Application.Abstraction.TokenGenerator.RefreshTokenGenerator;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Infrastructure.AI;
using CarScanner.Infrastructure.IdentityServices;
using CarScanner.Infrastructure.Notifications;
using CarScanner.Infrastructure.Storage;
using CarScanner.Infrastructure.Tenant;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarScanner.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<ITenantProvider, HttpHeaderTenantProvider>();

        services.AddSingleton(_ =>
            new BlobServiceClient(configuration.GetConnectionString("AzureBlobStorage")));

        services.AddScoped<IFileStorageService, AzureBlobStorageService>();

        services.AddScoped<IEmailNotificationService, ConsoleEmailNotificationService>();

		services.AddTokenGenerators(configuration);

        var useRealAI = configuration.GetSection("OpenAI:Enabled").Value == "true";
        if (useRealAI)
        {
            services.AddHttpClient<IVehicleDamageAnalyzer, OpenAIVehicleDamageAnalyzer>();
        }
        else
        {
            services.AddScoped<IVehicleDamageAnalyzer, MockVehicleDamageAnalyzer>();
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
