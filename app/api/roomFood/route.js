import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { bookingId, foodOrders } = body;

    if (!bookingId) {
      return Response.json({ message: "Booking ID required" }, { status: 400 });
    }

    const booking = await Booking.findOne({
      bookingId,
      status: "ACTIVE"
    });

    if (!booking) {
      return Response.json({ message: "Booking not active" }, { status: 400 });
    }

    // ✅ NEW: handle multiple food items
    if (Array.isArray(foodOrders)) {
      foodOrders.forEach(item => {
        booking.foodOrders.push({
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          total: item.price * item.qty,
          addedAt: new Date()
        });
      });
    }

    // ✅ BACKWARD COMPATIBILITY (single food)
    else {
      const { foodId, name, price, qty } = body;

      if (!foodId || !qty) {
        return Response.json({ message: "Invalid food data" }, { status: 400 });
      }

      booking.foodOrders.push({
        foodId,
        name,
        price,
        qty,
        total: price * qty,
        addedAt: new Date()
      });
    }

    await booking.save();
    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
