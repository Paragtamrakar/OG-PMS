"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import A4RoomBill from "./Print/A4RoomBill";

export default function RoomCheckout() {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch checked-in rooms when modal opens
  useEffect(() => {
    if (!open) return;

    async function fetchRooms() {
      const res = await fetch("/api/checkedIn");
      const data = await res.json();
      setRooms(data);
    }

    fetchRooms();
  }, [open]);

  // 🔥 Fetch bill preview
  async function handleSelect(id) {
    setSelectedId(id);
    if (!id) return;

    setLoading(true);
    const res = await fetch(`/api/checkOut/${id}`);
    const data = await res.json();
    setBill(data);
    setLoading(false);
  }

  // this helps in printing.
  function handlePrint() {
    setTimeout(() => {
      window.print();
    }, 300); // small delay so DOM fully render ho
  }

  // 🔥 Confirm checkout
  async function handleCheckout() {
    if (!selectedId) return;

    setLoading(true);

    // 🔹 1. Checkout
    const res = await fetch(`/api/checkOut/${selectedId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ paymentMethod })
    });

    if (!res.ok) {
      alert("Checkout failed");
      setLoading(false);
      return;
    }

    // 🔥 2. Fresh bill fetch karo (MOST IMPORTANT)
    const billRes = await fetch(`/api/checkOut/${selectedId}`);
    const updatedBill = await billRes.json();

    // 🔹 3. State update
    setBill(updatedBill);

    // 🔥 4. Thoda delay do React ko render karne ke liye
    setTimeout(() => {
      handlePrint(); // ✅ ab correct invoiceNumber print hoga
    }, 100);

    // 🔹 5. Close modal
    setTimeout(() => {
      setOpen(false);
      setSelectedId("");
      setBill(null);
      setPaymentMethod("Cash");
    }, 600);

    setLoading(false);
  }
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-800 text-white px-5 py-2.5 rounded shadow-xl hover:bg-slate-900 transition-all flex items-center gap-2 font-medium z-50 border border-slate-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
        Checkout
      </button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Settlement & Checkout
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Room Selection Section */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Occupied Room
                </label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 px-4 py-2.5 rounded text-slate-700 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Choose room for billing...</option>
                    {rooms.map((room) => (
                      <option key={room.bookingId} value={room.bookingId}>
                        Room {room.roomNo} — {room.guestName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Processing bill data...</span>
                </div>
              )}

              {/* Bill Details Section */}
              {bill && !loading && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50 border border-slate-200 rounded divide-y divide-slate-200">
                    {/* Header Info */}
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Guest Name</span>
                        <span className="text-sm font-semibold text-slate-700">{bill.guestName}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Stay Duration</span>
                        <span className="text-sm font-semibold text-slate-700">{bill.nights} Night{bill.nights !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Room Charges</span>
                        <span className="text-slate-900 tabular-nums">₹{bill.roomTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Food & Services</span>
                        <span className="text-slate-900 tabular-nums">₹{bill.foodTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Taxes (GST)</span>
                        <span className="text-slate-900 tabular-nums">₹{bill.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="p-4 bg-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Total Payable</span>
                      <span className="text-xl font-bold text-slate-900 tabular-nums">
                        ₹{bill.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Settlement Mode
                      </label>
                      <div className="flex gap-2">
                        {["Cash", "UPI", "Card"].map((method) => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium border transition-all ${paymentMethod === method
                              ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                              : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                              }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
              <div className="flex flex-col gap-3">
                {bill && (
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 rounded font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Confirm & Print Receipt
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {bill &&
        createPortal(
          <A4RoomBill booking={bill} />,
          document.body
        )}
    </>
  );
}