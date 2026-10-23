
"use client";

import { ROOMS } from "@/data/rooms";
import FoodPanel from "@/Components/FoodPanel";

export default function RoomGrid({
  occupiedRooms = [],
  activeRoomNo = null,
  onSelectRoom = () => {},
}) {
  return (
    <section className="flex-1 min-w-0 w-full max-w-full overflow-x-clip overflow-y-auto scroll-smooth no-print px-1 sm:px-2">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Room Inventory
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage room availability and bookings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            Available
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
            Occupied
          </span>
        </div>
      </div>

      {/* Responsive Rooms Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-3 sm:gap-4">

        {ROOMS.map((room) => {
          const booking = occupiedRooms.find(
            (r) => r.roomNo === room.roomNo
          );

          const isOccupied = Boolean(booking);
          const isActive = activeRoomNo === room.roomNo;

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom(room.roomNo)}
              aria-pressed={isActive}
              aria-label={`Room ${room.roomNo}, ${
                isOccupied ? "occupied" : "vacant"
              }`}
              className={`
                group relative flex min-w-0 w-full flex-col
                gap-4 rounded-2xl border bg-white p-3.5 sm:p-4
                text-left shadow-sm
                transition-[border-color,box-shadow,background-color]
                duration-200
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2
                active:scale-[0.99]
                ${
                  isOccupied
                    ? "border-rose-200 hover:border-rose-400 hover:shadow-md"
                    : "border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                }
                ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200"
                    : ""
                }
              `}
            >
              {/* Room Number + Status */}
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-slate-800">
                    #{room.roomNo}
                  </div>

                  <p
                    title={room.name}
                    className="mt-1 min-w-0 truncate text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {room.name}
                  </p>
                </div>

                <span
                  className={`
                    inline-flex max-w-[45%] shrink-0 items-center gap-1.5
                    rounded-full px-2 py-1
                    text-[9px] sm:text-[10px] font-bold tracking-wide
                    ${
                      isOccupied
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }
                  `}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      isOccupied ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="truncate">
                    {isOccupied ? "OCCUPIED" : "VACANT"}
                  </span>
                </span>
              </div>

              {/* Price + Category */}
              <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
                <div className="min-w-0">
                  <p className="mb-0.5 text-[10px] font-medium text-slate-400">
                    Base price
                  </p>

                  <p className="break-words text-lg sm:text-xl font-bold leading-tight text-indigo-600">
                    ₹{room.pricing.base.toLocaleString("en-IN")}
                  </p>
                </div>

                <span
                  title={room.category}
                  className="max-w-full rounded-md bg-slate-100 px-2 py-1 text-[10px] sm:text-xs font-semibold text-slate-600 break-words"
                >
                  {room.category}
                </span>
              </div>

              {/* Booking Dates */}
              {isOccupied && (
                <div className="min-w-0 rounded-lg border border-rose-100 bg-rose-50/70 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose-500">
                    Booking period
                  </p>

                  <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-rose-800 [overflow-wrap:anywhere]">
                    {new Date(booking.checkIn).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                    <span className="mx-1.5 text-rose-400">→</span>
                    {new Date(booking.checkOut).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Food Panel */}
      <div className="mt-5 min-w-0 max-w-full">
        <FoodPanel />
      </div>
    </section>
  );
}
