import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Next.js hot-reload error avoid karne ke liye:
export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);