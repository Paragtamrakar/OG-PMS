/**
 * TableCard
 * ---------
 * Yeh ek single table ka card hai jo main screen pe dikhta hai.
 * 
 * Kya dikhata hai:
 * - Table ka naam (T1, T2, etc.)
 * - Table free hai ya occupied
 * - Agar order chal raha hai to:
 *    → kitna time se baitha hai (timer)
 *    → kitne items hai
 *    → total bill kitna bana hai
 * 
 * Kaam:
 * - Sirf UI dikhana (logic nahi sambhalta)
 * - Click karte hi table open karta hai (OrderPanel)
 * 
 * Simple samajh:
 * → Yeh bas “table ka status card” hai
 */

"use client";
import { useMemo, useEffect, useState } from "react";
import { Users, Clock, ChefHat } from "lucide-react";

/** Live timer hook — updates every 30s */
function useOccupiedTimer(startedAt) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const calc = () => setElapsed(Math.floor((Date.now() - new Date(startedAt)) / 60000));
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}

export default function TableCard({ table, totals, onClick }) {
  const isOccupied = table.status === "occupied";
  const elapsed = useOccupiedTimer(isOccupied ? table.startedAt : null);
  const itemCount = table.order?.items?.reduce((a, i) => a + i.quantity, 0) || 0;

  const durationLabel = useMemo(() => {
    if (elapsed < 60) return `${elapsed}m`;
    return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
  }, [elapsed]);

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-2xl border-2 transition-all duration-200
        hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isOccupied
          ? "bg-red-50 border-red-200 hover:border-red-400 focus-visible:ring-red-400"
          : "bg-white border-slate-200 hover:border-emerald-400 focus-visible:ring-emerald-400"
        }
      `}
    >
      {/* Zone badge */}
      <span className={`
        absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
        ${isOccupied ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-400"}
      `}>
        {table.zone}
      </span>

      <div className="p-5 space-y-3">
        {/* Table name + status dot */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOccupied ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`} />
          <h3 className="font-bold text-lg leading-none">{table.name}</h3>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Users size={12} />
          <span>{table.capacity} seats</span>
        </div>

        {/* ── Occupied Details ── */}
        {isOccupied ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                <Clock size={12} />
                <span>{durationLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <ChefHat size={12} />
                <span>{itemCount} items</span>
              </div>
            </div>

            {/* Running total */}
            {totals && (
              <div className="bg-red-100 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-red-400 font-medium uppercase tracking-wide">Running Total</p>
                <p className="text-xl font-black font-mono text-red-700">₹{totals.finalAmount}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-1">
            <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wide">Available</p>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}