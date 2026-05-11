using CarScanner.Infrastructure.IdentityServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CarScanner.SharedKernel.Constants;

namespace CarScanner.WebApi.Extensions;

public static class AuthExtensions
{
	public static IServiceCollection AddAuth(this IServiceCollection services, AccessTokenOptions accessTokenOptions)
	{
		services.AddAuthentication(options =>
		{
			options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
			options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
			options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
			options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
			options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;

		})
		.AddJwtBearer(options =>
		{
			options.RequireHttpsMetadata = true;
			options.MapInboundClaims = false;
			options.TokenValidationParameters = new TokenValidationParameters
			{
				RoleClaimType = ClaimConstants.JwtRole,
				NameClaimType = ClaimConstants.JwtEmail,
				ValidateLifetime = true,
				ClockSkew = TimeSpan.FromSeconds(5),
				RequireExpirationTime = true,
				ValidateIssuer = true,
				ValidIssuer = accessTokenOptions.Issuer,
				ValidateAudience = true,
				ValidAudience = accessTokenOptions.Audience,
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(accessTokenOptions.SecurityKey))
			};
			options.Events = new JwtBearerEvents
			{
				OnAuthenticationFailed = context =>
				{
					if (context.Exception is SecurityTokenExpiredException)
					{
						context.Response.Headers.TryAdd("x-token-expired", "true");
					}
					return Task.CompletedTask;
				},
				OnMessageReceived = context =>
				{
					// SignalR WebSocket connection ne moze postaviti Authorization header,
					// pa token mora doci kao query string (?access_token=...).
					var path = context.HttpContext.Request.Path;
					if (path.StartsWithSegments("/hubs"))
					{
						var queryToken = context.Request.Query["access_token"];
						if (!string.IsNullOrEmpty(queryToken))
							context.Token = queryToken;
					}
					return Task.CompletedTask;
				}
			};
		});

		services.AddAuthorization();

		return services;
	}
	public static IApplicationBuilder UseAuth(this IApplicationBuilder app)
	{
		app
			.UseAuthentication()
			.UseAuthorization();

		return app;
	}
}