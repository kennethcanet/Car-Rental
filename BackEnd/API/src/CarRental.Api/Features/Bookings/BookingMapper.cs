using CarRental.Api.Domain.Entities;

namespace CarRental.Api.Features.Bookings;

internal static class BookingMapper
{
    internal static BookingResponse ToResponse(Booking b) => new()
    {
        Id = b.Id,
        VehicleId = b.VehicleId,
        VehicleMake = b.Vehicle.Make,
        VehicleModel = b.Vehicle.Model,
        VehicleYear = b.Vehicle.Year,
        CustomerId = b.CustomerId,
        PickupAt = b.PickupAt,
        ReturnAt = b.ReturnAt,
        Status = b.Status.ToString(),
        TotalAmount = b.TotalAmount,
        Notes = b.Notes,
        CreatedAt = b.CreatedAt
    };
}
