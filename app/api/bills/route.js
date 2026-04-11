import { connectDB } from "@/Mongodb/db"
import RestaurantBill from "@/Schema/RestaurantBill"
import Invoice from "@/Schema/Invoice"


// ================= GET BILLS =================
export async function GET(req) {

    await connectDB()

    const { searchParams } = new URL(req.url)

    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const start = new Date(from)
    const end = new Date(to)

    end.setHours(23, 59, 59, 999)

    const restaurant = await RestaurantBill.find({
        createdAt: { $gte: start, $lte: end }
    })

    const room = await Invoice.find({
        createdAt: { $gte: start, $lte: end }
    })

    return Response.json({
        restaurant,
        room
    })

}


// ================= UPDATE BILLS =================
export async function POST(req) {

    try {

        await connectDB()

        const body = await req.json()

        // ROOM BILL UPDATE
        if (body.type === "Room") {

            const roomTotal = (body.roomPrice || 0) * (body.nights || 1)

            const foodTotal = body.foodTotal || 0

            const subtotal = roomTotal + foodTotal

            const gstAmount = subtotal * 0.05   // 5% GST

            const grandTotal = subtotal + gstAmount

            const updated = await Invoice.findByIdAndUpdate(
                body._id,
                {
                    guestName: body.guestName,
                    roomNo: body.roomNo,
                    nights: body.nights,
                    roomPrice: body.roomPrice,

                    roomTotal,
                    foodTotal,
                    gstAmount,
                    grandTotal,

                    paymentMethod: body.paymentMethod,
                    edited: true,
                    editedAt: new Date()
                },
                { new: true }
            )

            return Response.json(updated)
        }


        // RESTAURANT BILL UPDATE
        // ================= RESTAURANT BILL =================
        if (body.type === "Restaurant") {

            // 🔥 SAFETY: backend pe bhi calculation (never trust frontend fully)
            const subtotal = body.items.reduce(
                (acc, i) => acc + ((i.price || 0) * (i.qty || 1)),
                0
            )

            const discount = Math.min(body.discount || 0, subtotal)

            const afterDiscount = subtotal - discount

            const gstPercent = body.gstPercent || 5

            const gstAmount = (afterDiscount * gstPercent) / 100

            const preciseTotal = afterDiscount + gstAmount

            const finalAmount = Math.round(preciseTotal)

            const roundOff = Number((finalAmount - preciseTotal).toFixed(2))

            const updated = await RestaurantBill.findByIdAndUpdate(
                body._id,
                {
                    items: body.items,

                    subtotal,
                    discount,

                    gstPercent,
                    gstAmount,
                    roundOff,

                    finalAmount,

                    paymentMode: body.paymentMode,

                    edited: true,
                    editedAt: new Date()
                },
                { new: true }
            )

            return Response.json(updated)
        }

        return Response.json(
            { message: "Invalid bill type" },
            { status: 400 }
        )

    } catch (err) {
        console.error(err)

        return Response.json(
            { message: "Update failed" },
            { status: 500 }
        )
    }

}