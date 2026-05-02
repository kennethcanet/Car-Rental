using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Locations.Update;

public class UpdateLocationRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}

public class UpdateLocationValidator : Validator<UpdateLocationRequest>
{
    public UpdateLocationValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}

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
