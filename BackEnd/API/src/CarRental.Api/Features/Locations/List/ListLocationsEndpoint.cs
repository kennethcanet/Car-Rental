using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Locations.List;

public class ListLocationsEndpoint : EndpointWithoutRequest<List<LocationResponse>>
{
    private readonly AppDbContext _db;

    public ListLocationsEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/locations");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var locations = await _db.Locations
            .OrderBy(l => l.Name)
            .Select(l => LocationMapper.ToResponse(l))
            .ToListAsync(ct);

        await Send.OkAsync(locations, ct);
    }
}
