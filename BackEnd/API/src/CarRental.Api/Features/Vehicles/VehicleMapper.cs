using CarRental.Api.Features.Locations;
using CarRental.Domain.Entities;

namespace CarRental.Api.Features.Vehicles;

internal static class VehicleMapper
{
    internal static VehicleSummaryResponse ToSummary(Vehicle v) => new()
    {
        Id = v.Id,
        Make = v.Make,
        Model = v.Model,
        Year = v.Year,
        Category = v.Category.ToString(),
        DailyRate = v.DailyRate,
        LocationId = v.LocationId,
        LocationName = v.Location.Name,
        FirstImageKey = v.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.ImageKey
    };

    internal static VehicleDetailResponse ToDetail(Vehicle v) => new()
    {
        Id = v.Id,
        Make = v.Make,
        Model = v.Model,
        Year = v.Year,
        Category = v.Category.ToString(),
        DailyRate = v.DailyRate,
        Description = v.Description,
        Location = LocationMapper.ToResponse(v.Location),
        Images = v.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new VehicleImageResponse
            {
                Id = i.Id,
                ImageKey = i.ImageKey,
                DisplayOrder = i.DisplayOrder
            })
            .ToList()
    };
}
