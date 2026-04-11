import { connectDB } from "@/Mongodb/db";
import RestaurantBill from "@/Schema/RestaurantBill";
import Invoice from "@/Schema/Invoice";
import { NextResponse } from "next/server";

export async function GET(req) {

    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const from = new Date(searchParams.get("from"));
        const to = new Date(searchParams.get("to"));
        const includeActivity = searchParams.get("includeActivity");
        to.setHours(23, 59, 59, 999);

        // ===== FETCH DATA =====
        const restaurantBills = await RestaurantBill.find({
            createdAt: { $gte: from, $lte: to }
        });

        const roomInvoices = await Invoice.find({
            createdAt: { $gte: from, $lte: to }
        });

        let totalRevenue = 0;
        let roomRevenue = 0;
        let foodRevenue = 0;
        let gstCollected = 0;

        // Recent activity
        let recentActivity = [];

        if (includeActivity === "true") {
            recentActivity = [
                ...restaurantBills.map(b => ({
                    id: b._id,
                    type: "Bill",
                    desc: "Restaurant Order",
                    amount: b.finalAmount || 0,
                    time: new Date(b.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    createdAt: b.createdAt
                })),

                ...roomInvoices.map(i => ({
                    id: i._id,
                    type: "Booking",
                    desc: "Room Booking",
                    amount: i.grandTotal || 0,
                    time: new Date(i.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    createdAt: i.createdAt
                }))
            ]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
        }

        const dailyMap = {};

        // ===== RESTAURANT WALK-IN =====
        restaurantBills.forEach(bill => {
            const date = bill.createdAt.toISOString().split("T")[0];

            const taxable = bill.subtotal || 0;
            const total = bill.finalAmount || 0;

            foodRevenue += taxable;
            totalRevenue += total;
            gstCollected += bill.gstAmount || 0;

            if (!dailyMap[date]) dailyMap[date] = 0;
            dailyMap[date] += total;
        });

        // ===== ROOM INVOICES =====
        roomInvoices.forEach(inv => {

            const date = inv.createdAt.toISOString().split("T")[0];

            const total = inv.grandTotal || 0;

            roomRevenue += total;
            totalRevenue += total;
            gstCollected += inv.gstAmount || 0;

            if (!dailyMap[date]) dailyMap[date] = 0;
            dailyMap[date] += total;

        });

        const dailyData = Object.keys(dailyMap)
            .sort()
            .map(date => ({
                date,
                revenue: dailyMap[date]
            }));

        return NextResponse.json({
            totalRevenue,
            roomRevenue,
            foodRevenue,
            gstCollected,
            totalBookings: restaurantBills.length + roomInvoices.length,
            dailyData,
            ...(includeActivity === "true" && { recentActivity })

        });

    } catch (err) {
        console.error("REPORT ERROR:", err);
        return NextResponse.json(
            { message: "Server error generating report" },
            { status: 500 }
        );
    }
}