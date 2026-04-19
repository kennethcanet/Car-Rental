using CarRental.Domain.Entities;
using CarRental.Infrastructure;
using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddInfrastructure(builder.Configuration)
    .AddAuthenticationJwtBearer(
        s => s.SigningKey = builder.Configuration["Jwt:SigningKey"]!,
        o =>
        {
            o.TokenValidationParameters.RoleClaimType = "role";
            o.TokenValidationParameters.NameClaimType = "sub";
        })
    .AddAuthorization()
    .AddFastEndpoints()
    .SwaggerDocument();

var app = builder.Build();

await SeedRolesAsync(app);

if (app.Environment.IsDevelopment())
    await SeedDevAdminAsync(app);

app.UseAuthentication()
   .UseAuthorization()
   .UseFastEndpoints()
   .UseSwaggerGen();

app.Run();

static async Task SeedRolesAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();
    foreach (var role in new[] { "Admin", "Customer" })
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new AppRole(role));
}

static async Task SeedDevAdminAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    const string adminEmail = "admin@carrental.dev";
    const string adminPassword = "Admin1234!";

    var existing = await userManager.FindByEmailAsync(adminEmail);
    if (existing is not null)
    {
        // Ensure the Admin role is assigned even if the user was created without it
        if (!await userManager.IsInRoleAsync(existing, "Admin"))
            await userManager.AddToRoleAsync(existing, "Admin");

        logger.LogInformation("Dev admin already exists: {Email}", adminEmail);
        return;
    }

    var admin = new AppUser
    {
        UserName = adminEmail,
        Email = adminEmail,
        FirstName = "Dev",
        LastName = "Admin"
    };

    var result = await userManager.CreateAsync(admin, adminPassword);
    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        logger.LogError("Dev admin seed failed: {Errors}", errors);
        throw new InvalidOperationException($"Could not seed dev admin: {errors}");
    }

    await userManager.AddToRoleAsync(admin, "Admin");
    logger.LogInformation("Dev admin seeded → email: {Email}  password: {Password}", adminEmail, adminPassword);
}

public partial class Program { }
