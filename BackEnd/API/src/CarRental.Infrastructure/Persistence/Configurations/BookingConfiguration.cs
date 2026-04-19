using CarRental.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarRental.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(b => b.Notes).HasMaxLength(1000);
        builder.Property(b => b.TotalAmount).HasPrecision(18, 2);
        builder.Property(b => b.CustomerId).HasMaxLength(450).IsRequired();

        builder.HasOne(b => b.Vehicle)
            .WithMany(v => v.Bookings)
            .HasForeignKey(b => b.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Customer)
            .WithMany()
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => new { b.VehicleId, b.PickupAt, b.ReturnAt });
        builder.HasQueryFilter(b => b.DeletedAt == null);
    }
}
