"use client";
import React, { useEffect, useState } from "react";

export default function MenuManager() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/food", { cache: "no-store" });
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price) return alert("Fill fields");

    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    setForm({ name: "", price: "", category: "" });
    loadFoods();
  };

  const handleUpdate = async (id, field, value) => {
    await fetch(`/api/food/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    loadFoods();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete item?")) return;

    await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });

    loadFoods();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Menu Manager</h1>
            <p className="text-slate-500 mt-1">Manage restaurant items, categories, and pricing in real-time.</p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="text-emerald-700 text-sm font-semibold">{foods.length} Total Items</span>
          </div>
        </header>

        {/* Add New Item Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Add New Item</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Item Name</label>
                <input
                  placeholder="e.g. Truffle Pasta"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50/50"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50/50"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Category</label>
                <input
                  placeholder="e.g. Main Course"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-slate-50/50"
                />
              </div>

              <div className="md:col-span-2">
                <button 
                  onClick={handleAdd} 
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Items List */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Menu Items</h2>
            <div className="flex gap-4 text-xs font-medium text-slate-400">
              <span className="hidden md:block">Click fields to edit inline</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {foods.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p>No items found. Add your first dish above!</p>
              </div>
            ) : (
              foods.map(food => (
                <div 
                  key={food._id} 
                  className="group hover:bg-slate-50/80 transition-all duration-150 px-6 py-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Name Field */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                      </div>
                      <input
                        defaultValue={food.name}
                        onBlur={e => handleUpdate(food._id, "name", e.target.value)}
                        className="bg-transparent font-semibold text-slate-800 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-md px-2 py-1 w-full outline-none transition-all"
                      />
                    </div>

                    {/* Price Field */}
                    <div className="md:col-span-2 flex items-center gap-1">
                      <span className="text-slate-400 font-medium">₹</span>
                      <input
                        type="number"
                        defaultValue={food.price}
                        onBlur={e => handleUpdate(food._id, "price", Number(e.target.value))}
                        className="bg-transparent font-medium text-slate-600 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-md px-2 py-1 w-full outline-none transition-all"
                      />
                    </div>

                    {/* Category Field */}
                    <div className="md:col-span-3">
                      <div className="flex items-center bg-slate-100/50 group-hover:bg-white rounded-lg px-3 py-1 border border-transparent group-hover:border-slate-200 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        <input
                          defaultValue={food.category}
                          onBlur={e => handleUpdate(food._id, "category", e.target.value)}
                          className="bg-transparent text-sm text-slate-500 w-full outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        <span className="md:hidden">Delete Item</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </section>

       
      </div>
    </div>
  );
}