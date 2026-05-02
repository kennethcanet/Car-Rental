using System.Data;
using CarRental.Api.Domain.Entities;
using CarRental.Api.Domain.Enums;
using CarRental.Api.Persistence;
using FastEndpoints;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Api.Features.Bookings.Create;

public class CreateBookingRequest
{
    public Guid VehicleId { get; set; }
    public DateTime PickupAt { get; set; }
    public DateTime ReturnAt { get; set; }
    public string? Notes { get; set; }
}

public class CreateBookingValidator : Validator<CreateBookingRequest>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.VehicleId).NotEmpty();
        RuleFor(x => x.PickupAt).NotEmpty().GreaterThan(DateTime.UtcNow).WithMessage("Pickup date must be in the future.");
        RuleFor(x => x.ReturnAt)
            .NotEmpty()
            .GreaterThan(x => x.PickupAt).WithMessage("Return date must be after pickup date.");
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes is not null);
    }
}

public class CreateBookingEndpoint : Endpoint<CreateBookingRequest, BookingResponse>
{
    private readonly AppDbContext _db;

    public CreateBookingEndpoint(AppDbContext db)
    {
        _db = db;
    }

    public override void Configure()
    {
        Post("/bookings");
        Roles(RoleNames.Admin, RoleNames.Customer);
    }

    public override async Task HandleAsync(CreateBookingRequest req, CancellationToken ct)
    {
        var customerId = User.FindFirst("sub")?.Value!;

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == req.VehicleId, ct);
            if (vehicle is null)
            {
                await tx.RollbackAsync(ct);
                await Send.NotFoundAsync(ct);
                return;
            }

            var hasOverlap = await _db.Bookings.AnyAsync(b =>
                b.VehicleId == req.VehicleId &&
                b.Status != BookingStatus.Cancelled &&
                b.PickupAt < req.ReturnAt &&
                b.ReturnAt > req.PickupAt, ct);

            if (hasOverlap)
            {
                await tx.RollbackAsync(ct);
                ThrowError("Vehicle is not available for the selected dates.", 409);
            }

            var days = Math.Ceiling((req.ReturnAt - req.PickupAt).TotalDays);
            var totalAmount = (decimal)days * vehicle.DailyRate;

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                VehicleId = req.VehicleId,
                CustomerId = customerId,
                PickupAt = req.PickupAt,
                ReturnAt = req.ReturnAt,
                Status = BookingStatus.Pending,
                TotalAmount = totalAmount,
                Notes = req.Notes
            };

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            await _db.Entry(booking).Reference(b => b.Vehicle).LoadAsync(ct);

            await Send.ResponseAsync(BookingMapper.ToResponse(booking), 201, ct);
        }
        catch (DbUpdateException)
        {
            await tx.RollbackAsync(ct);
            ThrowError("Vehicle is not available for the selected dates.", 409);
        }
    }
}
