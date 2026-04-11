import { connectDB } from "@/Mongodb/db";
import FoodMenu from "@/Schema/FoodMenu";

export async function GET() {
    await connectDB();
    const foods = await FoodMenu.find().sort({ name: 1 });
    return Response.json(foods);
}

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        const newFood = await FoodMenu.create({
            name: body.name,
            price: body.price,
            category: body.category,
        });

        return Response.json(newFood);
    } catch (err) {
        return Response.json({ error: "Create failed" }, { status: 500 });
    }
}
