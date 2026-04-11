import { connectDB } from "@/Mongodb/db";
import RestaurantBill from "@/Schema/RestaurantBill";
import { getNextSequence } from "@/lib/getNextSequence";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      customer,
      items,
      subtotal,
      discount,
      gstPercent,
      gstAmount,
      roundOff,
      finalAmount,
      paymentMode
    } = body;

    // 🔒 BASIC VALIDATION
    if (!items || items.length === 0) {
      return Response.json(
        { message: "No items in bill" },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const seq = await getNextSequence(`restaurantBill-${year}`);

    const billNo = `RB-${year}-${String(seq).padStart(5, "0")}`;

    const bill = await RestaurantBill.create({
      billNo,
      customer,
      items,
      subtotal,
      discount,
      gstPercent,
      gstAmount,
      roundOff,
      finalAmount,
      paymentMode,
      printedAt: new Date()
    });

    return Response.json({
      success: true,
      billId: bill._id,
      billNo: bill.billNo
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
