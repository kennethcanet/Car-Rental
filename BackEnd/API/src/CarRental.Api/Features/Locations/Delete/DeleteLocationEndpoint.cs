using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Locations.Delete;

public class DeleteLocationRequest
{
    public Guid Id { get; set; }
}

public class DeleteLocationEndpoint : Endpoint<DeleteLocationRequest>
{
    private readonly AppDbContext _db;

    public DeleteLocationEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Delete("/locations/{id}");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(DeleteLocationRequest req, CancellationToken ct)
    {
        var location = await _db.Locations.FirstOrDefaultAsync(l => l.Id == req.Id, ct);
        if (location is null) { await Send.NotFoundAsync(ct); return; }

        var hasActiveVehicles = await _db.Vehicles.AnyAsync(v => v.LocationId == req.Id, ct);
        if (hasActiveVehicles)
        {
            ThrowError("Cannot delete a location that has active vehicles.", 409);
        }

        location.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await Send.NoContentAsync(ct);
    }
}
