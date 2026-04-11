// This code is for printing bills in reports page / Edit bills 
import { connectDB } from "@/Mongodb/db"
import RestaurantBill from "@/Schema/RestaurantBill"
import Invoice from "@/Schema/Invoice"

export async function GET(req, context ) {
    try {
        await connectDB()
        const { params } = context
        const { id } = await params

        let bill = await RestaurantBill.findById(id)

        if (!bill) {
            bill = await Invoice.findById(id)
        }

        if (!bill) {
            return Response.json({ message: "Bill not found" }, { status: 404 })
        }

        return Response.json(bill)

    } catch (err) {
        console.error(err)
        return Response.json({ message: "Server error" }, { status: 500 })
    }
}