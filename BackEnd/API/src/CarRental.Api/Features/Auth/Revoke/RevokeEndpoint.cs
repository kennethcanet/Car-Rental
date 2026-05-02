using System.Security.Cryptography;
using System.Text;
using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Auth.Revoke;

public class RevokeRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RevokeValidator : Validator<RevokeRequest>
{
    public RevokeValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RevokeEndpoint : Endpoint<RevokeRequest>
{
    private readonly AppDbContext _db;

    public RevokeEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Post("/auth/revoke");
        Roles(RoleNames.Admin, RoleNames.Customer);
    }

    public override async Task HandleAsync(RevokeRequest req, CancellationToken ct)
    {
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(req.RefreshToken)));
        var userId = User.FindFirst("sub")?.Value;

        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.UserId == userId, ct);

        if (storedToken is not null)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }

        await Send.NoContentAsync(ct);
    }
}
