namespace CarRental.Api.Features.Vehicles.List;

public class ListVehiclesResponse
{
    public List<VehicleSummaryResponse> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
