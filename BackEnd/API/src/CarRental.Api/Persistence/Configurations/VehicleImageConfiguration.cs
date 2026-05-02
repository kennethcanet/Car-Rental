using CarRental.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarRental.Api.Persistence.Configurations;

public class VehicleImageConfiguration : IEntityTypeConfiguration<VehicleImage>
{
    public void Configure(EntityTypeBuilder<VehicleImage> builder)
    {
        builder.ToTable("VehicleImages");
        builder.HasKey(vi => vi.Id);
        builder.Property(vi => vi.ImageKey).HasMaxLength(500).IsRequired();

        builder.HasOne(vi => vi.Vehicle)
            .WithMany(v => v.Images)
            .HasForeignKey(vi => vi.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(vi => new { vi.VehicleId, vi.DisplayOrder });
    }
}
