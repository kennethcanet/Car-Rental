using CarRental.Api.Domain.Entities;
using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Locations.Create;

public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}

public class CreateLocationValidator : Validator<CreateLocationRequest>
{
    public CreateLocationValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}

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
