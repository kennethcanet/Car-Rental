using CarRental.Domain.Entities;
using CarRental.Infrastructure.Persistence;
using FastEndpoints;

namespace CarRental.Api.Features.Locations.Create;

public class CreateLocationEndpoint : Endpoint<CreateLocationRequest, LocationResponse>
{
    private readonly AppDbContext _db;

    public CreateLocationEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Post("/locations");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(CreateLocationRequest req, CancellationToken ct)
    {
        var location = new Location
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Address = req.Address,
            City = req.City,
            Country = req.Country
        };

        _db.Locations.Add(location);
        await _db.SaveChangesAsync(ct);

        await Send.ResponseAsync(LocationMapper.ToResponse(location), 201, ct);
    }
}
