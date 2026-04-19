using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Locations.Update;

public class UpdateLocationEndpoint : Endpoint<UpdateLocationRequest, LocationResponse>
{
    private readonly AppDbContext _db;

    public UpdateLocationEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Put("/locations/{id}");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(UpdateLocationRequest req, CancellationToken ct)
    {
        var location = await _db.Locations.FirstOrDefaultAsync(l => l.Id == req.Id, ct);
        if (location is null) { await Send.NotFoundAsync(ct); return; }

        location.Name = req.Name;
        location.Address = req.Address;
        location.City = req.City;
        location.Country = req.Country;

        await _db.SaveChangesAsync(ct);

        await Send.OkAsync(LocationMapper.ToResponse(location), ct);
    }
}
