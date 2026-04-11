/**
 * Restaurant Page (Main Controller)
 * ---------------------------------
 * Yeh sab kuch connect karta hai.
 * 
 * Kya karta hai:
 * - Food menu API se load karta hai
 * - TableGrid dikhata hai (main screen)
 * - Table click hone pe OrderPanel open karta hai
 * 
 * Flow:
 * - Start → TableGrid (sab tables dikhenge)
 * - Table click → OrderPanel (order screen)
 * - Bill complete → wapas TableGrid
 * 
 * Important:
 * - Khud logic nahi karta
 * - Sab kaam useTables hook ko deta hai
 * 
 * Simple samajh:
 * → Yeh boss hai jo sabko control karta hai
 */

"use client";
import { useState, useEffect } from "react";
import { Utensils, LayoutGrid } from "lucide-react";
import MenuManager from "@/Components/MenuManager";
import RestaurantThermalBill from "@/Components/Print/RestaurantThermalBill";
import TableGrid from "@/Components/Restaurant/TableGrid";
import OrderPanel from "@/Components/Restaurant/OrderPanel";
import { useTables } from "@/hooks/useTables";

export default function RestaurantPOS() {
  // ── Food Menu ───────────────────────────────────────────────────────────────
  const [foodMenu, setFoodMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [billNo, setBillNo] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoadingMenu(true);
        const res = await fetch("/api/food", { cache: "no-store" });
        const data = await res.json();
        setFoodMenu(
          data.map((item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
          }))
        );
      } catch (err) {
        console.error("Menu Load Error:", err);
      } finally {
        setLoadingMenu(false);
      }
    };
    loadMenu();
  }, []);

  // ── Table State (via custom hook) ───────────────────────────────────────────
  const {
    tablesState,
    activeTableId,
    setActiveTableId,
    activeTable,
    addItem,
    updateQuantity,
    removeItem,
    updateOrder,
    resetTable,
    computeTotals,
  } = useTables();

  // ── Print bill data (for RestaurantThermalBill) ──────────────────────────
  // We pass the active table's order into the thermal bill component
  const printOrder = activeTable?.order || { items: [], customer: { name: "", phone: "" }, discount: 0, gstPercent: 5 };
  const printTotals = computeTotals(printOrder);

  const view = activeTableId ? "order" : "grid";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <header className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center shadow-md print:hidden">
        <div>
          <a href="/" className="text-2xl font-bold tracking-tight text-white">OG-PMS</a>
          <p className="text-emerald-100 text-sm flex items-center gap-2">
            <Utensils size={14} /> Restaurant Management System
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-xs uppercase opacity-70 tracking-wide">Terminal</p>
            <p className="font-mono font-bold">POS-01</p>
          </div>
          {view === "order" && (
            <button
              onClick={() => setActiveTableId(null)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              <LayoutGrid size={15} /> Table View
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden print:block print:bg-white">

        {view === "grid" && (
          <TableGrid
            tablesState={tablesState}
            computeTotals={computeTotals}
            onTableSelect={(id) => setActiveTableId(id)}
          />
        )}

        {view === "order" && activeTable && (
          <OrderPanel
            setBillNo={setBillNo}
            table={activeTable}
            foodMenu={foodMenu}
            loadingMenu={loadingMenu}
            computeTotals={computeTotals}
            addItem={addItem}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            updateOrder={updateOrder}
            resetTable={(id) => {
              resetTable(id);
              setActiveTableId(null);
            }}
            onBack={() => setActiveTableId(null)}
          />
        )}
      </main>

      {/* ── THERMAL BILL (print only) ──────────────────────────────────────────── */}
      {/* Preserves existing RestaurantThermalBill — no changes needed there */}
      <RestaurantThermalBill
        billNo={billNo}
        customer={printOrder.customer}
        items={printOrder.items}
        totals={printTotals}
        discount={printOrder.discount}
        gstPercent={printOrder.gstPercent}
        today={new Date().toLocaleDateString("en-GB")}
      />

      {/* ── MENU MANAGER (hidden on print) ─────────────────────────────────────── */}
      <div className="print:hidden">
        <MenuManager />
      </div>
    </div>
  );
}