using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.Update;

public class UpdateVehicleRequest
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal DailyRate { get; set; }
    public Guid LocationId { get; set; }
    public string? Description { get; set; }
}

public class UpdateVehicleValidator : Validator<UpdateVehicleRequest>
{
    public UpdateVehicleValidator()
    {
        RuleFor(x => x.Make).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.Category)
            .NotEmpty()
            .Must(c => Enum.TryParse<VehicleCategory>(c, ignoreCase: true, out _))
            .WithMessage("Category must be one of: Sedan, SUV, Truck, Van, Luxury, Economy.");
        RuleFor(x => x.DailyRate).GreaterThan(0);
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
    }
}

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
