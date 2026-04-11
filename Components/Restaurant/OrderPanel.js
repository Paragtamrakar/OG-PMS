/**
 * OrderPanel (Main POS Screen)
 * ----------------------------
 * Yeh actual billing system hai jaha order banta hai.
 * 
 * Kya kar sakte ho:
 * - Food search karke add karna
 * - Quantity badhana / kam karna
 * - Item remove karna
 * - Customer name/phone add karna
 * - Discount aur GST apply karna
 * 
 * Final kaam:
 * - "Complete & Print" dabate hi:
 *    → bill calculate hota hai
 *    → DB me save hota hai
 *    → print nikalta hai
 *    → table reset ho jata hai
 * 
 * Important:
 * - Har table ka alag order hota hai
 * - Data tab tak local me rehta hai jab tak bill complete na ho
 * 
 * Simple samajh:
 * → Yeh  asli paisa banane wala screen hai 💀
 */



"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, Plus, Trash2, Printer, User, Phone,
  Utensils, CheckCircle2, AlertCircle, ChevronLeft,
  RefreshCw, Clock, Users
} from "lucide-react";

/** Live timer label hook */
function useTimer(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const calc = () => setElapsed(Math.floor((Date.now() - new Date(startedAt)) / 60000));
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed < 60 ? `${elapsed}m` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
}

export default function OrderPanel({
    setBillNo,
  table,
  foodMenu,
  loadingMenu,
  computeTotals,
  addItem,
  updateQuantity,
  removeItem,
  updateOrder,
  resetTable,
  onBack,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [billDetails, setBillDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [today] = useState(new Date().toLocaleDateString("en-GB"));
  const searchBoxRef = useRef(null);

  const { order, startedAt, name: tableName, capacity } = table;
  const { items, customer, discount, gstPercent } = order;
  const elapsed = useTimer(startedAt);

  const totals = useMemo(() => computeTotals(order), [order, computeTotals]);

  // ── Search ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setSearchResults(
        foodMenu.filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, foodMenu]);

  useEffect(() => {
    const handle = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleAddItem = (food) => {
    if (isLocked) return;
    addItem(table.id, food);
    setSearchQuery("");
    setSearchResults([]);
  };

  // ── Final Bill ───────────────────────────────────────────────────────────────
  const handleCompleteAndPrint = async () => {
    if (items.length === 0) {
      setError("Cannot generate an empty bill.");
      return;
    }
    setIsSaving(true);
    setError(null);

    const payload = {
      customer,
      items,
      subtotal: totals.subtotal,
      discount: Number(discount),
      gstPercent: Number(gstPercent),
      gstAmount: totals.gstAmount,
      roundOff: Number(totals.roundOff),
      finalAmount: totals.finalAmount,
      paymentMode: "CASH",
      tableId: table.id,
      tableName: table.name,
      printedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/restaurantBill/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setBillDetails(result);
         setBillNo(result.billNo || result.billNumber);
        setIsLocked(true);
        setTimeout(() => window.print(), 150);
      } else {
        throw new Error(result.message || "Failed to save bill");
      }
    } catch (err) {
      setError("Save Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewOrder = () => {
    resetTable(table.id);
    setIsLocked(false);
    setBillDetails(null);
    setError(null);
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Panel Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-semibold"
        >
          <ChevronLeft size={18} /> All Tables
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-3 flex-1">
          <div>
            <h2 className="font-bold text-lg leading-none">{tableName}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Users size={11} /> {capacity} seats
              </span>
              {startedAt && (
                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <Clock size={11} /> Occupied {elapsed}
                </span>
              )}
            </div>
          </div>
        </div>
        {isLocked && (
          <button
            onClick={handleNewOrder}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} /> Clear Table
          </button>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

        {/* LEFT: Items */}
        <div className="lg:col-span-8 overflow-y-auto p-6 space-y-5 print:hidden">

          {/* Search */}
          <div ref={searchBoxRef} className="relative">
            <div className={`flex items-center bg-white border-2 rounded-xl px-4 py-3 transition-all
              ${isLocked ? "opacity-50 bg-slate-50" : "focus-within:border-emerald-500 shadow-sm"}`}>
              <Search className="text-slate-400 mr-3 shrink-0" size={20} />
              <input
                type="text"
                placeholder={isLocked ? "Bill locked — Clear Table to start fresh" : "Search menu (e.g. Paneer, Dal, Roti)..."}
                className="w-full outline-none bg-transparent text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLocked}
                autoFocus
              />
            </div>
            {loadingMenu && (
              <p className="text-xs text-slate-400 mt-2 px-1">Loading menu…</p>
            )}
            {searchResults.length > 0 && !isLocked && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-2xl border border-slate-200 rounded-b-xl z-50 max-h-72 overflow-y-auto mt-1 divide-y">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="w-full flex justify-between items-center px-6 py-3.5 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="font-semibold group-hover:text-emerald-700">{item.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{item.category || "Main Course"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-600">₹{item.price}</span>
                      <div className="p-1 bg-emerald-100 rounded text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Plus size={15} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-5 py-3.5">Item</th>
                  <th className="px-5 py-3.5 text-center">Qty</th>
                  <th className="px-5 py-3.5 text-right">Price</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                  {!isLocked && <th className="px-5 py-3.5 text-center w-16" />}
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-slate-300">
                      <div className="flex flex-col items-center gap-2">
                        <Utensils size={36} />
                        <p className="font-medium italic">No items yet</p>
                        <p className="text-sm">Search and add items from the menu above</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{item.id}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {!isLocked && (
                            <button
                              onClick={() => updateQuantity(table.id, item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-lg text-slate-600 font-bold border text-sm transition-colors"
                            >−</button>
                          )}
                          <span className="font-bold w-5 text-center">{item.quantity}</span>
                          {!isLocked && (
                            <button
                              onClick={() => updateQuantity(table.id, item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-lg text-slate-600 font-bold border text-sm transition-colors"
                            >+</button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm">₹{item.price}</td>
                      <td className="px-5 py-3.5 text-right font-bold font-mono text-emerald-700">₹{item.price * item.quantity}</td>
                      {!isLocked && (
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => removeItem(table.id, item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Billing Summary */}
        <div className="lg:col-span-4 bg-white border-l border-slate-200 flex flex-col">

          {/* Customer */}
          <div className="p-5 border-b space-y-3 print:hidden">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Customer Details</h3>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Name (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all"
                value={customer.name}
                onChange={(e) => updateOrder(table.id, { customer: { ...customer, name: e.target.value } })}
                disabled={isLocked}
              />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Phone (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all"
                value={customer.phone}
                onChange={(e) => updateOrder(table.id, { customer: { ...customer, phone: e.target.value } })}
                disabled={isLocked}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="p-5 flex-1 space-y-3.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">₹{totals.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center gap-3 print:hidden">
              <label className="text-sm text-slate-500">Discount (₹)</label>
              <input
                type="number"
                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right font-mono text-sm outline-none focus:border-emerald-500"
                value={discount}
                onChange={(e) => updateOrder(table.id, { discount: e.target.value })}
                disabled={isLocked}
              />
            </div>

            <div className="flex justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">GST (%)</span>
                <input
                  type="number"
                  className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono text-sm outline-none focus:border-emerald-500"
                  value={gstPercent}
                  onChange={(e) => updateOrder(table.id, { gstPercent: e.target.value })}
                  disabled={isLocked}
                />
              </div>
              <span className="font-mono text-sm">₹{totals.gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-400 italic">
              <span>Round Off</span>
              <span className="font-mono">{totals.roundOff}</span>
            </div>

            <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200">
              <div className="flex justify-between items-end">
                <span className="font-bold">Total Payable</span>
                <p className="text-3xl font-black text-emerald-800 font-mono">₹{totals.finalAmount}</p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-5 bg-slate-50 border-t print:hidden">
            {!isLocked ? (
              <button
                onClick={handleCompleteAndPrint}
                disabled={isSaving || items.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Printer size={18} />}
                {isSaving ? "Finalizing…" : "Complete & Print"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="bg-emerald-100 p-1.5 rounded-full">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Bill Confirmed</p>
                    <p className="text-xs font-mono text-emerald-600">Invoice: {billDetails?.billNo || "—"}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-white border-2 border-emerald-600 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer size={18} /> Reprint Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}