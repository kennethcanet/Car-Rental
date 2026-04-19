using CarRental.Domain.Entities;

namespace CarRental.Api.Features.Locations;

internal static class LocationMapper
{
    internal static LocationResponse ToResponse(Location location) => new()
    {
        Id = location.Id,
        Name = location.Name,
        Address = location.Address,
        City = location.City,
        Country = location.Country
    };
}
