using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Bookings.Create;

public class CreateBookingValidator : Validator<CreateBookingRequest>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.VehicleId).NotEmpty();
        RuleFor(x => x.PickupAt).NotEmpty().GreaterThan(DateTime.UtcNow).WithMessage("Pickup date must be in the future.");
        RuleFor(x => x.ReturnAt)
            .NotEmpty()
            .GreaterThan(x => x.PickupAt).WithMessage("Return date must be after pickup date.");
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes is not null);
    }
}
