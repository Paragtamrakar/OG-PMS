import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Allow login + API + static files
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    // Agar already login hai aur /login open kar raha hai → redirect to home
    if (pathname.startsWith("/login")) {
      if (!token) {
        return NextResponse.next();
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET);

        const url = new URL(req.url);
        const from = url.searchParams.get("from");

        return NextResponse.redirect(new URL(from || "/", req.url));

      } catch (err) {
        // invalid/expired token → allow login page
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}