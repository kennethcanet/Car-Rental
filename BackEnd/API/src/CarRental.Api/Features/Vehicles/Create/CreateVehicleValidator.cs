using CarRental.Domain.Enums;
using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Vehicles.Create;

public class CreateVehicleValidator : Validator<CreateVehicleRequest>
{
    public CreateVehicleValidator()
    {
        RuleFor(x => x.Make).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.Category)
            .NotEmpty()
            .Must(c => Enum.TryParse<VehicleCategory>(c, ignoreCase: true, out _))
            .WithMessage("Category must be one of: Sedan, SUV, Truck, Van, Luxury, Economy.");
        RuleFor(x => x.DailyRate).GreaterThan(0);
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
    }
}
