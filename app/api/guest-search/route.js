import { connectDB } from "@/Mongodb/db";
import Booking from "@/Schema/Booking";

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const q = searchParams.get("q") || "";
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        let filter = {};

        // 🔎 Name / Phone / ID Search
        if (q) {
            filter.$or = [
                { "guest.name": { $regex: q, $options: "i" } },
                { "guest.phone": { $regex: q, $options: "i" } },
                { "guest.idNumber": { $regex: q, $options: "i" } },
                { bookingId: { $regex: q, $options: "i" } },

                // ⭐ new (other guests)
                { "guests.name": { $regex: q, $options: "i" } },
                { "guests.idNumber": { $regex: q, $options: "i" } }
            ];
        }

        // 📅 Date Filter (optional)
        if (from && to) {
            filter.checkIn = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const results = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        const formatted = [];

        results.forEach((b) => {

            const query = q.toLowerCase();

            // PRIMARY GUEST MATCH
            if (
                b.guest.name?.toLowerCase().includes(query) ||
                b.guest.phone?.includes(query) ||
                b.guest.idNumber?.toLowerCase().includes(query)
            ) {
                formatted.push({
                    id: b._id,
                    guestName: b.guest.name,
                    phone: b.guest.phone,
                    idType: b.guest.idType,
                    idNumber: b.guest.idNumber,
                    roomNo: b.roomSnapshot.roomNo,
                    checkIn: b.checkIn,
                    checkOut: b.checkOut,
                    status: b.status
                });
            }

            // OTHER GUEST MATCH
            if (b.guests && b.guests.length > 0) {
                b.guests.forEach((g) => {

                    if (
                        g.name?.toLowerCase().includes(query) ||
                        g.idNumber?.toLowerCase().includes(query)
                    ) {

                        formatted.push({
                            id: b._id + "-" + g.idNumber,
                            guestName: g.name,
                            phone: b.guest.phone,
                            idType: g.idType,
                            idNumber: g.idNumber,
                            roomNo: b.roomSnapshot.roomNo,
                            checkIn: b.checkIn,
                            checkOut: b.checkOut,
                            status: b.status
                        });

                    }

                });
            }

        });

        return Response.json(formatted);

    } catch (err) {
        console.error(err);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
