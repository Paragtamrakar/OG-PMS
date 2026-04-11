"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Loader2,
  Utensils,
  User,
  Search,
  CheckCircle2
} from "lucide-react";


export default function FoodPanel() {
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState("");

  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [qty, setQty] = useState(1);
  const [foodMenu, setFoodMenu] = useState([]);
  const [foodList, setFoodList] = useState([]); // ⭐ NEW
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const inputRef = useRef(null);

  //  for rooms 
  useEffect(() => {
    fetch("/api/checkRoom/today")
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]));
  }, []);

  // for food menus 
  useEffect(() => {
  async function loadMenu() {
    const res = await fetch("/api/food");
    const data = await res.json();

    const formatted = data.map(item => ({
      id: item._id,
      name: item.name,
      price: item.price,
      category: item.category
    }));

    setFoodMenu(formatted);
  }

  loadMenu();
}, []);
const filteredFood = foodMenu.filter(f =>
  f.name.toLowerCase().includes(query.toLowerCase())
);

  // ✅ STEP 1: Add food locally
  function addFood() {
    if (!selectedFood) return;

    setFoodList(prev => [
      ...prev,
      {
        foodId: selectedFood.id,
        name: selectedFood.name,
        price: selectedFood.price,
        qty,
        total: selectedFood.price * qty
      }
    ]);

    setQuery("");
    setSelectedFood(null);
    setQty(1);

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ✅ STEP 2: Save ALL food at once
  async function addFoodToRoom() {
    if (!bookingId || foodList.length === 0) return;

    try {
      setLoading(true);
      setSuccess("");

      const res = await fetch("/api/roomFood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          foodOrders: foodList
        })
      });

      if (!res.ok) throw new Error();

      const room = bookings.find(b => b.bookingId === bookingId);
      setSuccess(`✓ ${foodList.length} items added to Room ${room?.roomSnapshot?.roomNo}`);

      setFoodList([]);
      setTimeout(() => setSuccess(""), 2000);

    } catch {
      alert("Failed to add food");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl   mx-auto mt-8 bg-white border rounded-2xl shadow-xl ">
      {/* Header */}
      <div className="bg-emerald-600 px-6 py-4 flex justify-between rounded-2xl items-center">
        <div className="flex gap-3 text-white items-center">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Utensils size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add Food to Active Room</h2>
            <p className="text-[10px] uppercase tracking-widest text-emerald-100">
              Billing Terminal
            </p>
          </div>
        </div>
        {loading && <Loader2 className="animate-spin text-white" size={18} />}
      </div>

      <div className="p-6 space-y-6">
        {/* Room Select */}
        <section className="bg-slate-50 p-4 rounded-xl border">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex gap-2">
            <User size={14} className="text-emerald-600" />
            Active Room
          </label>

          <select
            value={bookingId}
            onChange={e => setBookingId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm"
          >
            <option value="">Select Room</option>
            {bookings.map(b => (
              <option key={b.bookingId} value={b.bookingId}>
                Room {b.roomSnapshot.roomNo} — {b.guest.name}
              </option>
            ))}
          </select>
        </section>

        {/* Food Add */}
        <section className={!bookingId ? "opacity-40 pointer-events-none" : ""}>
          <div className="grid md:grid-cols-12 gap-4 items-end">
            {/* Food */}
            <div className="md:col-span-7 relative">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Food Item
              </label>
              <div className="relative">
                <Search className="  absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setSelectedFood(null);
                  }}
                  placeholder="Type food name..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>

              {query && !selectedFood && (
                <div className="absolute left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                  {filteredFood.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFood(f);
                        setQuery(f.name);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex justify-between"
                    >
                      <span>{f.name}</span>
                      <span className="font-bold text-emerald-600">₹{f.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Qty */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(+e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm font-bold"
              />
            </div>

            {/* Add Item */}
            <div className="md:col-span-3">
              <button
                onClick={addFood}
                disabled={!selectedFood}
                className="w-full h-[42px] bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>
        </section>

        {/* Selected Food List */}
        {foodList.length > 0 && (
          <div className="border rounded-xl p-4 bg-slate-50 space-y-2">
            <h4 className="text-sm font-bold">Selected Foods</h4>
            {foodList.map((f, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{f.name} × {f.qty}</span>
                <span className="font-semibold">₹{f.total}</span>
              </div>
            ))}

            <button
              onClick={addFoodToRoom}
              className="mt-3 w-full bg-emerald-700 text-white py-2 rounded-lg font-bold"
            >
              Add to Room
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-50 border rounded-xl px-4 py-3 flex gap-3">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}
