using CarScanner.Application.Behaviors;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace CarScanner.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            config.AddOpenBehavior(typeof(UnitOfWorkPipelineBehavior<,>));
            services.AddScoped(typeof(IPasswordHasher<>), typeof(PasswordHasher<>));
});

        return services;
    }
}
