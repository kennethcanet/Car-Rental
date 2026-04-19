namespace CarRental.Api.Features.Bookings;

public class BookingResponse
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public DateTime PickupAt { get; set; }
    public DateTime ReturnAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
