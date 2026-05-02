using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Bookings.Cancel;

public class CancelBookingRequest
{
    public Guid Id { get; set; }
}

public class CancelBookingEndpoint : Endpoint<CancelBookingRequest>
{
    private readonly AppDbContext _db;

    public CancelBookingEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Post("/bookings/{id}/cancel");
        Roles(RoleNames.Admin, RoleNames.Customer);
    }

    public override async Task HandleAsync(CancelBookingRequest req, CancellationToken ct)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == req.Id, ct);
        if (booking is null) { await Send.NotFoundAsync(ct); return; }

        var userId = User.FindFirst("sub")?.Value!;
        if (booking.CustomerId != userId && !User.IsInRole(RoleNames.Admin))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        if (booking.Status is BookingStatus.Active or BookingStatus.Completed or BookingStatus.Cancelled)
        {
            ThrowError("Cannot cancel a booking that is active, completed, or already cancelled.", 400);
        }

        booking.Status = BookingStatus.Cancelled;
        await _db.SaveChangesAsync(ct);

        await Send.NoContentAsync(ct);
    }
}
