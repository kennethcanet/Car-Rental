using FastEndpoints;
using FluentValidation;

namespace CarRental.Api.Features.Auth.Revoke;

public class RevokeValidator : Validator<RevokeRequest>
{
    public RevokeValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
