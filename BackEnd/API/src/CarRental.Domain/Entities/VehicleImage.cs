namespace CarRental.Domain.Entities;

public class VehicleImage
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string ImageKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
}
