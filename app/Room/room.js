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
  onSelectRoom = () => { }
}) {
  return (
    <section className="flex-[3] z-20 overflow-y-auto pr-2 no-print ">
      {/* Header */}
      <div className="mb-4 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-slate-700">Room Inventory</h2>

        <div className="flex gap-4 text-sm font-medium">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            Available
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            Occupied
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ROOMS.map((room) => {
          const booking = occupiedRooms.find(
            (r) => r.roomNo === room.roomNo
          );

          const isOccupied = !!booking;

          const isActive = activeRoomNo === room.roomNo;

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.roomNo)}
              className={`relative h-40 rounded-xl border-2 transition-all p-4 text-left flex flex-col justify-between shadow-sm bg-white
                ${isOccupied
                  ? "border-rose-500 hover:shadow-rose-100"
                  : "border-emerald-500 hover:shadow-emerald-100"}
                ${isActive ? "ring-4 ring-indigo-200 scale-[1.02]" : ""}
              `}
            >
              {/* Status Badge */}
              <div
                className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold text-white
                  ${isOccupied ? "bg-rose-500" : "bg-emerald-500"}
                `}
              >
                {isOccupied ? "OCCUPIED" : "VACANT"}
              </div>

              {/* Room Info */}
              <div>
                <div className="text-3xl font-black text-slate-800">
                  #{room.roomNo}
                </div>
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">
                  {room.name}
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-end">
                <div className="text-lg font-bold text-indigo-600">
                  ₹{room.pricing.base.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">
                  {room.category}
                </div>
              </div>
              
              {isOccupied && (
                <div className="mt-2 px-2 py-1 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">

                  {new Date(booking.checkIn).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}

                  {" → "}

                  {new Date(booking.checkOut).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
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
