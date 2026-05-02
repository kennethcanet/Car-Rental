using CarRental.Api.Domain.Entities;
using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.Create;

public class CreateVehicleRequest
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal DailyRate { get; set; }
    public Guid LocationId { get; set; }
    public string? Description { get; set; }
}

public class CreateVehicleValidator : Validator<CreateVehicleRequest>
{
    public CreateVehicleValidator()
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
