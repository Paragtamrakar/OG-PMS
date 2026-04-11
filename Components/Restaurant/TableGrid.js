/**
 * TableGrid
 * ----------
 * Yeh saare tables ko ek jagah grid me dikhata hai.
 * 
 * Kya karta hai:
 * - Sab tables ko list karta hai
 * - Kaun available hai aur kaun occupied → count dikhata hai
 * - Tables ko zone ke hisaab se group karta hai (floor / hall)
 * 
 * Kaam:
 * - Har table ke liye TableCard render karta hai
 * - Table pe click → uska order screen open hota hai
 * 
 * Simple samajh:
 * → Yeh pura restaurant ka dashboard hai (table overview)
 */



"use client";
import TableCard from "./TableCard";

export default function TableGrid({ tablesState, computeTotals, onTableSelect }) {
  // Group tables by zone
  const zones = [...new Set(tablesState.map((t) => t.zone))];

  const occupied = tablesState.filter((t) => t.status === "occupied").length;
  const available = tablesState.length - occupied;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">

      {/* Summary Bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-slate-600">{available} Available</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-600">{occupied} Occupied</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">Total: {tablesState.length} Tables</span>
        </div>
      </div>

      {/* Zones */}
      {zones.map((zone) => {
        const zoneTables = tablesState.filter((t) => t.zone === zone);
        return (
          <section key={zone}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
              {zone} — {zoneTables.length} Tables
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {zoneTables.map((table) => {
                const totals = table.status === "occupied" && table.order
                  ? computeTotals(table.order)
                  : null;
                return (
                  <TableCard
                    key={table.id}
                    table={table}
                    totals={totals}
                    onClick={() => onTableSelect(table.id)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}