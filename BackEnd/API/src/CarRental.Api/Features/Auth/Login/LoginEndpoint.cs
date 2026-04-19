using System.Security.Cryptography;
using System.Text;
using CarRental.Domain.Entities;
using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CarRental.Api.Features.Auth.Login;

public class LoginEndpoint : Endpoint<LoginRequest, LoginResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public LoginEndpoint(UserManager<AppUser> userManager, AppDbContext db, IConfiguration config)
    {
        _userManager = userManager;
        _db = db;
        _config = config;
    }

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, req.Password))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var jwtExpiry = DateTime.UtcNow.AddMinutes(15);

        var accessToken = JwtBearer.CreateToken(o =>
        {
            o.SigningKey = _config["Jwt:SigningKey"]!;
            o.ExpireAt = jwtExpiry;
            foreach (var role in roles)
                o.User.Roles.Add(role);
            o.User.Claims.Add(new System.Security.Claims.Claim("sub", user.Id));
            o.User.Claims.Add(new System.Security.Claims.Claim("email", user.Email!));
            o.User.Claims.Add(new System.Security.Claims.Claim("firstName", user.FirstName));
        });

        var rawRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken)));

        await _db.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow), ct);

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });

        await _db.SaveChangesAsync(ct);

        await Send.OkAsync(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            AccessTokenExpiry = jwtExpiry,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles
        }, ct);
    }
}
