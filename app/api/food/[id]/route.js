import { connectDB } from "@/Mongodb/db";
import FoodMenu from "@/Schema/FoodMenu";

export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;  

  const body = await req.json();

  const updated = await FoodMenu.findByIdAndUpdate(id, body, {
    new: true,
  });

  return Response.json(updated);
}


export async function DELETE(req, context) {
    await connectDB();

    const { id } = await context.params;    

    await FoodMenu.findByIdAndDelete(id);

    return Response.json({ success: true });
}

