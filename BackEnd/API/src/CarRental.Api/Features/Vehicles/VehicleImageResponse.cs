namespace CarRental.Api.Features.Vehicles;

public class VehicleImageResponse
{
    public Guid Id { get; set; }
    public string ImageKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}
