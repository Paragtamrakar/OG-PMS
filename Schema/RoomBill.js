import mongoose from "mongoose";

const roomBillSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    type: {
      type: String,
      enum: ["FOOD", "SERVICE", "LAUNDRY", "OTHER"],
      default: "FOOD"
    },

    description: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      default: 1
    },

    price: {
      type: Number,
      required: true
    },

    amount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.RoomBill ||
  mongoose.model("RoomBill", roomBillSchema);
