import { connectDB } from "@/Mongodb/db";
import Admin from "@/Schema/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";   // ⭐ important

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return NextResponse.json({ success: false, message: "Email not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return NextResponse.json({ success: false, message: "Wrong password" });
  }

  // JWT token
  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const response = NextResponse.json({ success: true });

  //  cookie set karne ka  tareeka
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: false, // production me true karenge
     sameSite: "lax",
    path: "/",
  });

  return response;
}