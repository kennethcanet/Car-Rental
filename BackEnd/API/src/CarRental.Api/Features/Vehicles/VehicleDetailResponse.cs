using CarRental.Api.Features.Locations;

namespace CarRental.Api.Features.Vehicles;

public class VehicleDetailResponse
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal DailyRate { get; set; }
    public string? Description { get; set; }
    public LocationResponse Location { get; set; } = null!;
    public List<VehicleImageResponse> Images { get; set; } = new();
}
