using CarRental.Domain.Enums;
using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.Update;

public class UpdateVehicleEndpoint : Endpoint<UpdateVehicleRequest, VehicleSummaryResponse>
{
    private readonly AppDbContext _db;

    public UpdateVehicleEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Put("/vehicles/{id}");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(UpdateVehicleRequest req, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.Location)
            .Include(v => v.Images)
            .FirstOrDefaultAsync(v => v.Id == req.Id, ct);

        if (vehicle is null) { await Send.NotFoundAsync(ct); return; }

        if (vehicle.LocationId != req.LocationId)
        {
            var locationExists = await _db.Locations.AnyAsync(l => l.Id == req.LocationId, ct);
            if (!locationExists)
            {
                ThrowError(r => r.LocationId, "Location not found.", 404);
            }
        }

        vehicle.Make = req.Make;
        vehicle.Model = req.Model;
        vehicle.Year = req.Year;
        vehicle.Category = Enum.Parse<VehicleCategory>(req.Category, ignoreCase: true);
        vehicle.DailyRate = req.DailyRate;
        vehicle.LocationId = req.LocationId;
        vehicle.Description = req.Description;

        await _db.SaveChangesAsync(ct);

        await _db.Entry(vehicle).Reference(v => v.Location).LoadAsync(ct);

        await Send.OkAsync(VehicleMapper.ToSummary(vehicle), ct);
    }
}
