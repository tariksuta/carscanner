using CarScanner.Application;
using CarScanner.Infrastructure;
using CarScanner.Infrastructure.IdentityServices;
using CarScanner.Persistence;
using CarScanner.WebApi.Endpoints.Auth;
using CarScanner.WebApi.Endpoints.Billing;
using CarScanner.WebApi.Endpoints.Branches;
using CarScanner.WebApi.Endpoints.Clients;
using CarScanner.WebApi.Endpoints.DamageReports;
using CarScanner.WebApi.Endpoints.Inspections;
using CarScanner.WebApi.Endpoints.Rentals;
using CarScanner.WebApi.Endpoints.Employees;
using CarScanner.WebApi.Endpoints.PlatformAdmin;
using CarScanner.WebApi.Endpoints.Profile;
using CarScanner.WebApi.Endpoints.Vehicles;
using CarScanner.WebApi.Extensions;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

var authConfig = builder
	.Configuration
	.GetSection("TokenOptions:AccessTokenOptions")
	.Get<AccessTokenOptions>()!;

builder
	.Services
	.AddAuth(authConfig);

builder.Services.AddCors(options =>
{
	options.AddPolicy("CorsPolicy", policy =>
	{
		policy
			.AllowAnyOrigin()
			.AllowAnyMethod()
			.AllowAnyHeader();
	});
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "CarScanner API",
        Version = "v1",
        Description = "API for rent-a-car vehicle damage detection using AI"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only the access token (no 'Bearer ' prefix). Get it from Angular DevTools → Application → Local Storage → access_token."
    });

    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", hostDocument: doc),
            new List<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "CarScanner API v1");
    });
}

app
	.UseRouting()
	.UseCors("CorsPolicy")
	.UseAuth();

app.UseHttpsRedirection();

app.MapAuthEndpoints();
app.MapVehicleEndpoints();
app.MapClientEndpoints();
app.MapRentalEndpoints();
app.MapInspectionEndpoints();
app.MapDamageReportEndpoints();
app.MapEmployeeEndpoints();
app.MapBranchEndpoints();
app.MapProfileEndpoints();
app.MapBillingEndpoints();
app.MapPlatformAdminBillingEndpoints();

app.Run();
