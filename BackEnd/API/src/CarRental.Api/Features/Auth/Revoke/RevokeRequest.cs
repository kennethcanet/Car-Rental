namespace CarRental.Api.Features.Auth.Revoke;

public class RevokeRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
