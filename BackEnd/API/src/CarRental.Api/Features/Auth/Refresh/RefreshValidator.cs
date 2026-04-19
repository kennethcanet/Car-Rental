using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Auth.Refresh;

public class RefreshValidator : Validator<RefreshRequest>
{
    public RefreshValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
