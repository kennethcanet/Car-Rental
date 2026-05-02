using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Vehicles.List;

public class ListVehiclesRequest
{
    public Guid? LocationId { get; set; }
    public string? Category { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ListVehiclesResponse
{
    public List<VehicleSummaryResponse> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}

public class ListVehiclesEndpoint : Endpoint<ListVehiclesRequest, ListVehiclesResponse>
{
    private readonly AppDbContext _db;

    public ListVehiclesEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/vehicles");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ListVehiclesRequest req, CancellationToken ct)
    {
        var query = _db.Vehicles
            .Include(v => v.Location)
            .Include(v => v.Images)
            .AsQueryable();

        if (req.LocationId.HasValue)
            query = query.Where(v => v.LocationId == req.LocationId.Value);

        if (!string.IsNullOrWhiteSpace(req.Category) &&
            Enum.TryParse<VehicleCategory>(req.Category, ignoreCase: true, out var category))
            query = query.Where(v => v.Category == category);

        if (req.AvailableFrom.HasValue && req.AvailableTo.HasValue)
        {
            var from = req.AvailableFrom.Value;
            var to = req.AvailableTo.Value;
            query = query.Where(v => !v.Bookings.Any(b =>
                b.DeletedAt == null &&
                b.Status != BookingStatus.Cancelled &&
                b.PickupAt < to &&
                b.ReturnAt > from));
        }

        var totalCount = await query.CountAsync(ct);
        var pageSize = Math.Clamp(req.PageSize, 1, 100);
        var page = Math.Max(req.Page, 1);

        var vehicles = await query
            .OrderBy(v => v.Make).ThenBy(v => v.Model)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        await Send.OkAsync(new ListVehiclesResponse
        {
            Items = vehicles.Select(VehicleMapper.ToSummary).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        }, ct);
    }
}
