import { sendCheckoutMessage } from "@/scripts/whatsapp-bot";

export async function POST(req) {
  console.log("PHONE ID:", process.env.PHONE_NUMBER_ID);
  try {
    const body = await req.json();

    const { phone, name, totalAmount, nights } = body;

    // ✅ Validation
    if (!phone || !name) {
      console.log("❌ Phone missing in booking");
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendCheckoutMessage(
      phone,
      name,
      totalAmount,
      nights
    );

    return Response.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("Checkout WhatsApp Error:", err.message);

    return Response.json(
      { error: "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}