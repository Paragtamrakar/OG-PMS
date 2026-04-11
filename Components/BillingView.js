"use client";

import { Printer, User } from "lucide-react";

export default function BillingView({ booking, room }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase">
          Guest Name
        </label>
        <div className="text-xl font-bold flex items-center gap-2 mt-1">
          <User size={18} className="text-indigo-500" />
          {booking.guestName}
        </div>
      </div>

      {/* Charges + summary (same structure as tera old code) */}

      <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
        <Printer size={20} />
        SETTLE & PRINT BILL
      </button>
    </div>
  );
}
