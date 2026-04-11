"use client";

import { Search, XCircle } from "lucide-react";
import BookingForm from "./BookingForm";
import BillingView from "./BillingView";
import { ROOMS } from "@/data/rooms";

export default function Sidebar({
  activeRoomNo,
  activeBooking,
  onClose,
  onBookingSuccess

}) {
  if (!activeRoomNo) {
    return (
      <aside className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col no-print overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Search size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">
            Select a room to view details or create a booking
          </p>
        </div>
      </aside>
    );
  }

  const room = ROOMS.find(r => r.roomNo === activeRoomNo);

  return (
    <aside className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col no-print overflow-hidden">
      
      {/* Header */}
      <div
        className={`p-6 border-b text-white ${
          activeBooking ? "bg-rose-600" : "bg-emerald-600"
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold ">Room {activeRoomNo}</h3>
            <p className="text-sm opacity-80">{room?.name}</p>
          </div>

          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded">
            <XCircle size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeBooking ? (
          <BillingView booking={activeBooking} room={room} />
        ) : (
          <BookingForm room={room}
            onBookingSuccess={onBookingSuccess} />
        )}
      </div>
    </aside>
  );
}
