"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function CheckRoomAvailability({ onCheckDates }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCheck() {
    if (!checkIn || !checkOut) return;

    setLoading(true);

    // 👇 SIRF DATES PARENT KO BHEJ RAHE HAIN
    onCheckDates({ checkIn, checkOut });

    setTimeout(() => {
      setLoading(false);
    }, 300);
  }

  useEffect(() => {
  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 30);

  const format = (date) => date.toISOString().split("T")[0];

  const checkInDate = format(today);
  const checkOutDate = format(tomorrow);

  setCheckIn(checkInDate);
  setCheckOut(checkOutDate);

  // parent ko automatically bhej do
  onCheckDates({
    checkIn: checkInDate,
    checkOut: checkOutDate
  });

}, []);

  return (
    <div className="w-full mb-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">

        <div className="flex flex-col md:flex-row items-center gap-2">

          <div className="flex-1 flex items-center px-6 py-3">
            <Calendar className="text-slate-400 mr-3" size={18} />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <ArrowRight className="hidden md:block text-slate-300" />

          <div className="flex-1 flex items-center px-6 py-3">
            <Calendar className="text-slate-400 mr-3" size={18} />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Checking
              </>
            ) : (
              <>
                <Search size={18} />
                Check Availability
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
