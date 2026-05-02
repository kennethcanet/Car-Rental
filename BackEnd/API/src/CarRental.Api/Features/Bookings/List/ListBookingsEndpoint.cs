using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Bookings.List;

public class ListBookingsEndpoint : EndpointWithoutRequest<List<BookingResponse>>
{
    private readonly AppDbContext _db;

    public ListBookingsEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/bookings");
        Roles(RoleNames.Admin, RoleNames.Customer);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.FindFirst("sub")?.Value!;
        var isAdmin = User.IsInRole(RoleNames.Admin);

        var query = _db.Bookings.Include(b => b.Vehicle).AsQueryable();

        if (!isAdmin)
            query = query.Where(b => b.CustomerId == userId);

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(ct);

        await Send.OkAsync(bookings.Select(BookingMapper.ToResponse).ToList(), ct);
    }
}
