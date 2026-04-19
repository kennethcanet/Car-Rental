namespace CarRental.Api.Features.Bookings.Create;

public class CreateBookingRequest
{
    public Guid VehicleId { get; set; }
    public DateTime PickupAt { get; set; }
    public DateTime ReturnAt { get; set; }
    public string? Notes { get; set; }
}
