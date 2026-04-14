import { connectDB } from "@/Mongodb/db";
import Invoice from "@/Schema/Invoice";
import Booking from "@/Schema/Booking";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = new Date(searchParams.get("from"));
    const to = new Date(searchParams.get("to"));

    const invoices = await Invoice.find({
      checkIn: { $lte: to },
      checkOut: { $gte: from }
    });

    const bookings = await Booking.find(); // 🔥 sab le lo (simple)

    return Response.json({
      invoices,
      bookings
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}