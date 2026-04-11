import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ServiceDown from "@/Components/ServiceDown";
const isActive = process.env.NEXT_PUBLIC_SITE_ACTIVE === "true";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OG-PMS billing management",
  description: "Designed by The OG Developers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          {!isActive ? <ServiceDown /> : children} 
      </body>
    </html>
  );
}
