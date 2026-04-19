namespace CarRental.Api.Features.Vehicles;

public class VehicleSummaryResponse
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal DailyRate { get; set; }
    public Guid LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string? FirstImageKey { get; set; }
}
