using CarRental.Api.Domain.Enums;

namespace CarRental.Api.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public DateTime PickupAt { get; set; }
    public DateTime ReturnAt { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
    public AppUser Customer { get; set; } = null!;
}
