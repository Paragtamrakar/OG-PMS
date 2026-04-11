"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BedDouble,
  UtensilsCrossed,
  BarChart3,
  UserCircle,
  Clock
} from "lucide-react";

const NAV_CONFIG = [
  { id: "Rooms", label: "Rooms", icon: BedDouble, path: "/" },
  { id: "Restaurant", label: "Restaurant", icon: UtensilsCrossed, path: "/Restaurant" },
  { id: "Reports", label: "Reports", icon: BarChart3, path: "/Reports" },
  { id: "Verify", label: "Guest Verify", icon: UserCircle, path: "/verify" }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ must be inside component

  const [currentTime, setCurrentTime] = useState(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="mb-10 sticky top-0 border rounded-xl z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">

        {/* BRAND */}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
           OG - <span className="text-emerald-600 font-extrabold">PMS</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Billing & Accounting System
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200">
          {NAV_CONFIG.map((item) => {
            const Icon = item.icon;

            // ✅ Active detection from URL
            const isActive =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(item.path));

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`
                  relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95
                  ${isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white"}
                `}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {/* USER */}
          <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
            <div className="text-right hidden xl:block">
              <p className="text-xs font-bold text-slate-900">Front Desk</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase">
                Administrator
              </p>
            </div>
            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
              <UserCircle size={22} />
            </div>
          </div>

          {/* CLOCK */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="text-right tabular-nums">
              <div className="text-sm font-bold text-slate-900">
                {currentTime
                  ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "--:--"}
              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase">
                {currentTime
                  ? currentTime.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                  : "—"}
              </div>
            </div>

            <div className="p-2 bg-emerald-50 rounded-lg">
              <Clock size={16} className="text-emerald-600" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
