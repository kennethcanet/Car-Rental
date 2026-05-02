using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.Delete;

public class DeleteVehicleRequest
{
    public Guid Id { get; set; }
}

public class DeleteVehicleEndpoint : Endpoint<DeleteVehicleRequest>
{
    private readonly AppDbContext _db;

    public DeleteVehicleEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Delete("/vehicles/{id}");
        Roles(RoleNames.Admin);
    }

    public override async Task HandleAsync(DeleteVehicleRequest req, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == req.Id, ct);
        if (vehicle is null) { await Send.NotFoundAsync(ct); return; }

        var hasActiveBookings = await _db.Bookings.AnyAsync(b =>
            b.VehicleId == req.Id &&
            (b.Status == BookingStatus.Pending ||
             b.Status == BookingStatus.Confirmed ||
             b.Status == BookingStatus.Active), ct);

        if (hasActiveBookings)
        {
            ThrowError("Cannot delete a vehicle with pending, confirmed, or active bookings.", 409);
        }

        vehicle.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await Send.NoContentAsync(ct);
    }
}
