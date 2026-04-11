import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

export async function GET(req) {

  await connectDB();

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const bookings = await Booking.find({
    checkIn: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  }).sort({ checkIn: 1 });

  return Response.json(bookings);
}