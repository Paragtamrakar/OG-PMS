import { sendCheckinMessage } from "@/scripts/whatsapp-bot";



export async function POST(req) {

    try {
        const body = await req.json();

        const { phone, name, roomNo, checkOut } = body;

        // ✅ Basic validation
        if (!phone || !name) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ Send message
        const result = await sendCheckinMessage(
            phone,
            name,
            roomNo,
            checkOut
        );

        return Response.json({
            success: true,
            result
        });

    } catch (err) {
        console.error("Checkin WhatsApp Error:", err.message);

        return Response.json(
            { error: "Failed to send WhatsApp" },
            { status: 500 }
        );
    }
}