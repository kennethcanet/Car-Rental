using System.Security.Claims;
using CarRental.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Bookings.GetById;

public class GetBookingByIdEndpoint : Endpoint<GetBookingByIdRequest, BookingResponse>
{
    private readonly AppDbContext _db;

    public GetBookingByIdEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Get("/bookings/{id}");
        Roles(RoleNames.Admin, RoleNames.Customer);
    }

    public override async Task HandleAsync(GetBookingByIdRequest req, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == req.Id, ct);

        if (booking is null) { await Send.NotFoundAsync(ct); return; }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (booking.CustomerId != userId && !User.IsInRole(RoleNames.Admin))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        await Send.OkAsync(BookingMapper.ToResponse(booking), ct);
    }
}
