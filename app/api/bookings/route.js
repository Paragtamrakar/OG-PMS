import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

// ✅ EXISTING — DO NOT TOUCH
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // 🔥 NEW — overlap check
    const existingBooking = await Booking.findOne({
      "roomSnapshot.roomNo": body.roomSnapshot.roomNo,
      status: "ACTIVE",
      checkIn: { $lt: new Date(body.checkOut) },
      checkOut: { $gt: new Date(body.checkIn) }
    });

    if (existingBooking) {
      return Response.json(
        { success: false, message: "Room already booked for these dates" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      ...body,
      bookingId: `BK-${Date.now()}`
    });

    return Response.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: "Room already booked for these dates" },
      { status: 500 }
    );
  }
}

// ✅ NEW — ADD THIS BELOW
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    // agar dates nahi aayi to empty list
    if (!checkIn || !checkOut) {
      return Response.json([]);
    }

    // 🔥 DATE OVERLAP LOGIC (REAL HOTEL LOGIC)
    const bookings = await Booking.find({
      status: "ACTIVE",
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) }
    });

    return Response.json(bookings);
  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
