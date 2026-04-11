import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
});


export default mongoose.models.FoodMenu ||
  mongoose.model("FoodMenu", foodSchema);
