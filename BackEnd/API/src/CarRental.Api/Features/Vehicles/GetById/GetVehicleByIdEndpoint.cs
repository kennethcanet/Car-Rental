using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.GetById;

public class GetVehicleByIdEndpoint : Endpoint<GetVehicleByIdRequest, VehicleDetailResponse>
{
    private readonly AppDbContext _db;

    public GetVehicleByIdEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/vehicles/{id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetVehicleByIdRequest req, CancellationToken ct)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.Location)
            .Include(v => v.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(v => v.Id == req.Id, ct);

        if (vehicle is null) { await Send.NotFoundAsync(ct); return; }

        await Send.OkAsync(VehicleMapper.ToDetail(vehicle), ct);
    }
}
