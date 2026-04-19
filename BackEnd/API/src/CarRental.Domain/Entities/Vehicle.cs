using CarRental.Domain.Enums;

namespace CarRental.Domain.Entities;

public class Vehicle
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleCategory Category { get; set; }
    public decimal DailyRate { get; set; }
    public Guid LocationId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public Location Location { get; set; } = null!;
    public ICollection<VehicleImage> Images { get; set; } = new List<VehicleImage>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
