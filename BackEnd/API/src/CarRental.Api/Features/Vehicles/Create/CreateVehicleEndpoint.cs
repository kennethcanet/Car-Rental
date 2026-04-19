using CarRental.Domain.Entities;
using CarRental.Domain.Enums;
using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.Create;

public class CreateVehicleEndpoint : Endpoint<CreateVehicleRequest, VehicleSummaryResponse>
{
    private readonly AppDbContext _db;

    public CreateVehicleEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Post("/vehicles");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(CreateVehicleRequest req, CancellationToken ct)
    {
        var locationExists = await _db.Locations.AnyAsync(l => l.Id == req.LocationId, ct);
        if (!locationExists)
        {
            ThrowError(r => r.LocationId, "Location not found.", 404);
        }

        var category = Enum.Parse<VehicleCategory>(req.Category, ignoreCase: true);

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            Make = req.Make,
            Model = req.Model,
            Year = req.Year,
            Category = category,
            DailyRate = req.DailyRate,
            LocationId = req.LocationId,
            Description = req.Description
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(vehicle).Reference(v => v.Location).LoadAsync(ct);

        await Send.ResponseAsync(VehicleMapper.ToSummary(vehicle), 201, ct);
    }
}
