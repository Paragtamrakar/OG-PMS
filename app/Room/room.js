"use client";
import React from "react";
import { ROOMS } from "@/data/rooms";
import FoodPanel from "@/Components/FoodPanel";

/**
 * Rooms Inventory Grid
 * UI only – no business logic
 */
export default function RoomGrid({
  occupiedRooms = [],
  activeRoomNo = null,
  onSelectRoom = () => {},
}) {
  return (
    <section className="flex-[3] z-20 overflow-y-auto overflow-x-hidden scroll-smooth no-print px-0 sm:pr-2">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-700">
          Room Inventory
        </h2>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full shrink-0"></div>
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-500 rounded-full shrink-0"></div>
            Occupied
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {ROOMS.map((room) => {
          const booking = occupiedRooms.find((r) => r.roomNo === room.roomNo);
          const isOccupied = !!booking;
          const isActive = activeRoomNo === room.roomNo;

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.roomNo)}
              className={`relative h-32 sm:h-36 lg:h-40 rounded-xl border-2 transition-all p-3 sm:p-4 text-left flex flex-col justify-between shadow-sm bg-white active:scale-[0.98] touch-manipulation
                ${
                  isOccupied
                    ? "border-rose-500 hover:shadow-rose-100"
                    : "border-emerald-500 hover:shadow-emerald-100"
                }
                ${isActive ? "ring-4 ring-indigo-200 scale-[1.02]" : ""}
              `}
            >
              {/* Status Badge */}
              <div
                className={`absolute top-0 right-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg rounded-tr-lg text-[10px] sm:text-xs font-bold text-white leading-tight
                  ${isOccupied ? "bg-rose-500" : "bg-emerald-500"}
                `}
              >
                {isOccupied ? "OCCUPIED" : "VACANT"}
              </div>

              {/* Room Info */}
              <div className="pr-14 sm:pr-16">
                <div className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                  #{room.roomNo}
                </div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mt-0.5 sm:mt-1 truncate">
                  {room.name}
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-end">
                <div className="text-base sm:text-lg font-bold text-indigo-600">
                  ₹{room.pricing.base.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 shrink-0 ml-1">
                  {room.category}
                </div>
              </div>

              {isOccupied && (
                <div className="mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-50 border border-rose-200 rounded text-[9px] sm:text-xs text-rose-700 leading-snug break-words">
                  {new Date(booking.checkIn).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {" → "}
                  {new Date(booking.checkOut).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <FoodPanel />
    </section>
  );
}