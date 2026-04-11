import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

// this api is for dropdown of Room bill component.

export async function GET() {
  try {
    await connectDB();

    const bookings = await Booking.find({
      status: "ACTIVE"
    }).select("_id guest roomSnapshot checkIn checkOut");

    const formatted = bookings.map((b) => ({
      bookingId: b._id,  // Mongo _id
      roomNo: b.roomSnapshot.roomNo,
      guestName: b.guest.name,  // FIXED
      checkIn: b.checkIn,
      checkOut: b.checkOut
    }));

    return Response.json(formatted);

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

