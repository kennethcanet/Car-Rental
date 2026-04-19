using CarRental.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarRental.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Make).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Model).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Description).HasMaxLength(2000);
        builder.Property(v => v.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(v => v.DailyRate).HasPrecision(18, 2);

        builder.HasOne(v => v.Location)
            .WithMany(l => l.Vehicles)
            .HasForeignKey(v => v.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(v => new { v.LocationId, v.Category });
        builder.HasQueryFilter(v => v.DeletedAt == null);
    }
}
