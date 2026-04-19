using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Locations.Create;

public class CreateLocationValidator : Validator<CreateLocationRequest>
{
    public CreateLocationValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}
