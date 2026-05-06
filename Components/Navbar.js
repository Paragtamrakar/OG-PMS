"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BedDouble,
  UtensilsCrossed,
  BarChart3,
  UserCircle,
  Clock,
  Menu,
  X
} from "lucide-react";

const NAV_CONFIG = [
  { id: "Rooms", label: "Rooms", icon: BedDouble, path: "/" },
  { id: "Restaurant", label: "Restaurant", icon: UtensilsCrossed, path: "/Restaurant" },
  { id: "Reports", label: "Reports", icon: BarChart3, path: "/Reports" },
  { id: "Verify", label: "Guest Verify", icon: UserCircle, path: "/verify" }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [currentTime, setCurrentTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── TOP NAVBAR ── */}
      <header className="mb-4 sm:mb-6 lg:mb-10 sticky top-0 border rounded-xl z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">

          {/* BRAND */}
          <div className="flex flex-col shrink-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              OG - <span className="text-emerald-600 font-extrabold">PMS</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Billing & Accounting System
            </p>
          </div>

          {/* DESKTOP NAVIGATION (lg+) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200">
            {NAV_CONFIG.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path !== "/" && pathname.startsWith(item.path));
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`
                    relative flex items-center gap-2 px-4 xl:px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95
                    ${isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white"}
                  `}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 ml-auto lg:ml-0">

            {/* USER */}
            <div className="flex items-center gap-2 sm:gap-3 sm:pr-4 lg:pr-6 sm:border-r border-slate-200">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-slate-900">Front Desk</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">
                  Administrator
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 shrink-0">
                <UserCircle size={20} />
              </div>
            </div>

            {/* CLOCK */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <div className="text-right tabular-nums">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  {currentTime
                    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "--:--"}
                </div>
                <div className="hidden md:block text-[10px] text-slate-400 font-bold uppercase">
                  {currentTime
                    ? currentTime.toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                    : "—"}
                </div>
              </div>
              <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg shrink-0">
                <Clock size={15} className="text-emerald-600" />
              </div>
            </div>

            {/* MOBILE CLOCK (time only) */}
            <div className="flex sm:hidden items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {currentTime
                  ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "--:--"}
              </span>
              <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
                <Clock size={13} className="text-emerald-600" />
              </div>
            </div>

            {/* HAMBURGER (below lg) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* DROPDOWN MENU (mobile/tablet) */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {NAV_CONFIG.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/" && pathname.startsWith(item.path));
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.path);
                      setMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] text-left
                      ${isActive
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "text-slate-600 hover:bg-slate-100"}
                    `}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile user + date row */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Front Desk</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Administrator</p>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-xs font-bold text-slate-900">
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
            </div>
          </div>
        )}
      </header>

      {/* ── BOTTOM TAB BAR (mobile only, sm and below) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
        <div className="grid grid-cols-4 h-16">
          {NAV_CONFIG.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-95 touch-manipulation
                  ${isActive ? "text-emerald-600" : "text-slate-400"}`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-150 ${isActive ? "bg-emerald-50" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                </div>
                <span className={`text-[10px] font-semibold leading-none ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}