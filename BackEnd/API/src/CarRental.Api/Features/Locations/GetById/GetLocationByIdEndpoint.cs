using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Locations.GetById;

public class GetLocationByIdEndpoint : Endpoint<GetLocationByIdRequest, LocationResponse>
{
    private readonly AppDbContext _db;

    public GetLocationByIdEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/locations/{id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetLocationByIdRequest req, CancellationToken ct)
    {
        var location = await _db.Locations.FirstOrDefaultAsync(l => l.Id == req.Id, ct);
        if (location is null) { await Send.NotFoundAsync(ct); return; }

        await Send.OkAsync(LocationMapper.ToResponse(location), ct);
    }
}
