import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },

    roomSnapshot: {
      roomNo: { type: Number, required: true },
      name: { type: String, required: true },
      pricePerNight: { type: Number, required: true }
    },

    guest: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      idType: { type: String, required: true },
      idNumber: { type: String, required: true },

      fatherName: String,
      age: Number,
      numberOfGuests: Number,
      fromCity: String,
      toCity: String,
      vehicleNumber: String,
      purposeOfVisit: String,

      address: String
    },

    // 🔥 multiple guest IDs
    guests: [
      {
        name: String,
        idType: String,
        idNumber: String,
        age: Number
      }
    ],

    // 🔥 EXTRA CHARGES
    extras: [
      {
        item: String,
        price: Number,
        qty: Number,
        total: Number,
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    foodOrders: [
      {
        foodId: String,
        name: String,
        price: Number,
        qty: Number,
        total: Number,
        addedAt: Date
      }
    ],

    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CHECKED_OUT", "CLOSED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);
// 🔍 Search Optimization Indexes (Police enquiry fast search)
BookingSchema.index({ "guest.name": "text" });
BookingSchema.index({ "guest.phone": 1 });
BookingSchema.index({ "guest.idNumber": 1 });
BookingSchema.index({ checkIn: 1 });
BookingSchema.index({ checkOut: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
