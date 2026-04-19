namespace CarRental.Api.Features.Vehicles.List;

public class ListVehiclesRequest
{
    public Guid? LocationId { get; set; }
    public string? Category { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
