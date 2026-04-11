import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    invoiceNumber: {
      type: String,
      unique: true
    },

    roomNo: {
      type: Number,
      required: true
    },

    guestName: {
      type: String,
      required: true
    },

    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true
    },

    nights: {
      type: Number,
      required: true
    },

    roomPrice: {
      type: Number,
      required: true
    },

    roomTotal: {
      type: Number,
      required: true
    },

    foodTotal: {
      type: Number,
      default: 0
    },

    gstAmount: {
      type: Number,
      required: true
    },

    grandTotal: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      required: true
    },
    edited: {
      type: Boolean,
      default: false
    },

    editedAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);
