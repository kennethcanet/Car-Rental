using Microsoft.AspNetCore.Identity;

namespace CarRental.Api.Domain.Entities;

public class AppRole : IdentityRole
{
    public AppRole() { }
    public AppRole(string roleName) : base(roleName) { }
}
