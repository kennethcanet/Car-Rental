using System.Security.Cryptography;
using System.Text;
using CarRental.Api.Domain.Entities;
using CarRental.Api.Persistence;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CarRental.Api.Features.Auth.Refresh;

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiry { get; set; }
}

public class RefreshValidator : Validator<RefreshRequest>
{
    public RefreshValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshEndpoint : Endpoint<RefreshRequest, RefreshResponse>
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public RefreshEndpoint(AppDbContext db, UserManager<AppUser> userManager, IConfiguration config)
    {
        _db = db;
        _userManager = userManager;
        _config = config;
    }

    public override void Configure()
    {
        Post("/auth/refresh");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RefreshRequest req, CancellationToken ct)
    {
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(req.RefreshToken)));

        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (storedToken is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (storedToken.RevokedAt is not null)
        {
            await _db.RefreshTokens
                .Where(rt => rt.UserId == storedToken.UserId && rt.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow), ct);
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (storedToken.ExpiresAt < DateTime.UtcNow)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var user = await _userManager.FindByIdAsync(storedToken.UserId);
        if (user is null)
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

        var rawNewRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var newTokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawNewRefreshToken)));

        storedToken.RevokedAt = DateTime.UtcNow;

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = newTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });

        await _db.SaveChangesAsync(ct);

        await Send.OkAsync(new RefreshResponse
        {
            AccessToken = accessToken,
            RefreshToken = rawNewRefreshToken,
            AccessTokenExpiry = jwtExpiry
        }, ct);
    }
}
