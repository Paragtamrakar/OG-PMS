import mongoose from "mongoose";

const RestaurantBillSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true
    },

    customer: {
      name: String,
      phone: String
    },

    items: [
      {
        foodId: String,
        name: String,
        price: Number,
        qty: Number,
        total: Number
      }
    ],

    subtotal: Number,
    discount: Number,
    gstPercent: Number,
    gstAmount: Number,
    roundOff: Number,
    finalAmount: Number,

    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "Cash/Card"],
      default: "CASH"
    },

    status: {
      type: String,
      enum: ["PAID", "CANCELLED"],
      default: "PAID"
    },

    printedAt: Date ,
    
    edited: {
      type: Boolean,
      default: false
    },

    editedAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.RestaurantBill ||
  mongoose.model("RestaurantBill", RestaurantBillSchema);
