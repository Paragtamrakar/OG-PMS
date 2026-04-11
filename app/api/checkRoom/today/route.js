import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

export async function GET() {
  try {
    await connectDB();

    // 🔹 Aaj ka full din (hotel logic)
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const activeBookings = await Booking.find({
      status: "ACTIVE",
      checkIn: { $lte: end },
      checkOut: { $gt: start }
    }).select("bookingId roomSnapshot guest checkIn checkOut");

    return Response.json(activeBookings);

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
