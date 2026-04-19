using Microsoft.AspNetCore.Identity;

namespace CarRental.Domain.Entities;

public class AppRole : IdentityRole
{
    public AppRole() { }
    public AppRole(string roleName) : base(roleName) { }
}
