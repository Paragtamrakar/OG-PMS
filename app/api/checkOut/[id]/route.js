import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";
import Invoice from "@/Schema/Invoice";
import { getNextSequence } from "@/lib/getNextSequence";


export async function POST(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const { paymentMethod } = await req.json();

    const booking = await Booking.findById(id);

    if (!booking) {
      return Response.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "ACTIVE") {
      return Response.json(
        { message: "Already checked out" },
        { status: 400 }
      );
    }

    // 🔥 Early Checkout Support
    const today = new Date();
    const checkOutDate = new Date(booking.checkOut);
    const effectiveCheckout =
      today < checkOutDate ? today : checkOutDate;

    // 🔥 Nights Calculation
    let nights = Math.ceil(
      (effectiveCheckout - new Date(booking.checkIn)) /
      (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) nights = 1;

    // 🔥 Room Price (correct field)
    const roomPrice = booking.roomSnapshot.pricePerNight;
    const roomTotal = nights * roomPrice;

    // 🔥 Fetch RoomBill Items
    const foodItems = booking.foodOrders || [];

    const foodTotal = foodItems.reduce(
      (sum, item) => sum + item.total,
      0
    );


    const subtotal = roomTotal + foodTotal;

    // 🔥 GST Slab Logic
    let gstRate = 0.05;

    const gstAmount = subtotal * gstRate;
    const grandTotal = subtotal + gstAmount;


    const year = new Date().getFullYear();
    const seq = await getNextSequence(`roomInvoice-${year}`);

    const invoiceNumber = `AV-${year}-${String(seq).padStart(5, "0")}`;

    // 🔥 Create Invoice
    await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      roomNo: booking.roomSnapshot.roomNo,
      guestName: booking.guest.name,
      checkIn: booking.checkIn,
      checkOut: effectiveCheckout,
      nights,
      roomPrice,
      roomTotal,
      foodItems: foodItems,
      foodTotal,
      gstAmount,
      grandTotal,
      paymentMethod
    });

    // 🔥 Update Booking Status
    booking.status = "CHECKED_OUT";
    await booking.save();

    return Response.json({
      success: true,
      message: "Checkout successful"
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// ==============================
// 🔥 BILL PREVIEW (GET)
// ==============================

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return Response.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    const checkOutDate = new Date(booking.checkOut);
    const effectiveCheckout =
      today < checkOutDate ? today : checkOutDate;

    let nights = Math.ceil(
      (effectiveCheckout - new Date(booking.checkIn)) /
      (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) nights = 1;

    const roomPrice = booking.roomSnapshot.pricePerNight;
    const roomTotal = nights * roomPrice;

    // 🔥 FIXED PART
    const foodItems = booking.foodOrders || [];

    const foodTotal = foodItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const subtotal = roomTotal + foodTotal;

    let gstRate = 0.05;
    const gstAmount = subtotal * gstRate;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const grandTotal = subtotal + gstAmount;

    const invoice = await Invoice.findOne({ bookingId: booking._id });

    return Response.json({
      // 🔹 IDs
      bookingId: booking.bookingId,
      invoiceNumber: invoice?.invoiceNumber || null,

      // 🔹 ROOM
      roomNo: booking.roomSnapshot.roomNo,
      roomPrice: booking.roomSnapshot.pricePerNight,

      // 🔹 GUEST
      guestName: booking.guest.name,
      fromCity: booking.guest.fromCity,
      address: booking.guest.address,

      // 🔹 DATES (🔥 IMPORTANT)
      checkIn: booking.checkIn.toISOString(),
      checkOut: effectiveCheckout.toISOString(),

      // 🔹 CALCULATED
      nights,
      roomTotal,

      foodItems,
      foodTotal,

      subtotal,
      gstRate,

      gstAmount,
      cgst,
      sgst,
      grandTotal
    });

  } catch (err) {
    console.error("ERROR:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
