using CarRental.Domain.Entities;
using FastEndpoints;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;

namespace CarRental.Api.Features.Auth.Register;

public class RegisterEndpoint : Endpoint<RegisterRequest, RegisterResponse>
{
    private readonly UserManager<AppUser> _userManager;

    public RegisterEndpoint(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public override void Configure()
    {
        Post("/auth/register");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RegisterRequest req, CancellationToken ct)
    {
        var user = new AppUser
        {
            UserName = req.Email,
            Email = req.Email,
            FirstName = req.FirstName,
            LastName = req.LastName
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
                AddError(new ValidationFailure("", error.Description));
            await Send.ErrorsAsync(400, ct);
            return;
        }

        await _userManager.AddToRoleAsync(user, RoleNames.Customer);

        await Send.ResponseAsync(new RegisterResponse { UserId = user.Id, Email = user.Email! }, 201, ct);
    }
}
