using CarScanner.Application.Abstraction.Authorization;
using CarScanner.SharedKernel.Authorization;

namespace CarScanner.WebApi.Authorization;

public static class RequireModuleExtensions
{
    public static TBuilder RequireModule<TBuilder>(this TBuilder builder, Module module)
        where TBuilder : IEndpointConventionBuilder
    {
        builder.AddEndpointFilter(async (context, next) =>
        {
            var featureService = context.HttpContext.RequestServices.GetRequiredService<IFeatureService>();
            var enabled = await featureService.IsModuleEnabledAsync(module, context.HttpContext.RequestAborted);

            if (!enabled)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status403Forbidden,
                    title: "Module not enabled",
                    detail: $"Module '{module}' is not enabled for the current tenant's pricing plan.");
            }

            return await next(context);
        });

        return builder;
    }
}
