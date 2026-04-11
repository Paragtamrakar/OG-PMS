"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, FileEdit, X, Save, IndianRupee, Tag, User, BedDouble, Utensils } from 'lucide-react';
import RestaurantThermalBill from "./Print/RestaurantThermalBill";
import A4RoomBill from "./Print/A4RoomBill";
import Loader from "@/Components/Loader/Loader";

export default function EditBills() {

    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [bills, setBills] = useState([])
    const [editing, setEditing] = useState(null)
    const [printBill, setPrintBill] = useState(null)
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false)


    // LOAD BILLS
    async function loadBills() {
        if (!from || !to) {
            alert("Select date range")
            return
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/bills?from=${from}&to=${to}`)
            const data = await res.json()

            const restaurantBills = data.restaurant.map(b => ({
                ...b,
                type: "Restaurant",
                displayAmount: b.finalAmount
            }))

            const roomBills = data.room.map(b => ({
                ...b,
                type: "Room",
                displayAmount: b.grandTotal
            }))

            const merged = [...restaurantBills, ...roomBills].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )

            setBills(merged)
        } finally {
            setLoading(false);
        }
    }

    // Food menu suggestions/search system


    // Handle Print bills
    async function handlePrint(bill) {

        const res = await fetch(`/api/bills/${bill._id}`)
        const fullBill = await res.json()
        console.log("Full bill:", fullBill)

        setPrintBill({
            ...fullBill,
            type: bill.type   // important
        })


    }

    useEffect(() => {
        if (printBill) {
            setTimeout(() => {
                window.print()

                window.onafterprint = () => {
                    setPrintBill(null)
                }
            }, 300)
        }
    }, [printBill])

    // Restaurant menu items fetching 
    useEffect(() => {
        fetch("/api/food")
            .then(res => res.json())
            .then(data => setMenuItems(data));
    }, []);

    // Formatted restaurant bills 
    const formatBillForPrint = (bill) => {
        return {
            billNo: bill.billNo,
            customer: bill.customer,
            items: bill.items,

            totals: {
                subtotal: bill.subtotal || 0,
                gstAmount: bill.gstAmount || 0,
                roundOff: bill.roundOff || 0,
                finalAmount: bill.finalAmount || 0
            },

            discount: bill.discount || 0,
            gstPercent: bill.gstPercent || 0,
            today: new Date(bill.createdAt).toLocaleDateString("en-GB")
        };
    };
    let formattedBill = null;

    if (printBill && printBill.type === "Restaurant") {
        formattedBill = formatBillForPrint(printBill);
    }

    async function saveEdit() {

        let payload = editing

        if (editing.type === "Restaurant") {

            const subtotal = editing.items.reduce(
                (acc, i) => acc + ((i.price || 0) * (i.qty || 1)),
                0
            );

            const discount = Math.min(editing.discount || 0, subtotal);

            const afterDiscount = subtotal - discount;

            const gstPercent = editing.gstPercent || 0;

            const gstAmount = (afterDiscount * gstPercent) / 100;

            const preciseTotal = afterDiscount + gstAmount;

            const finalAmount = Math.round(preciseTotal);

            const roundOff = Number((finalAmount - preciseTotal).toFixed(2));

            payload = {
                ...editing,
                subtotal,
                discount,
                gstPercent,
                gstAmount,
                roundOff,
                finalAmount
            };
        }

        await fetch("/api/bills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        setEditing(null)
        loadBills()

    }

    const inputClasses = "w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400";
    const labelClasses = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 antialiased text-slate-900">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* HEADER SECTION */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">
                            Billing Records
                        </h2>
                        <p className="text-sm text-slate-500">Manage and edit existing restaurant and room invoices.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="date"
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="date"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                        <button
                            onClick={loadBills}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >

                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader variant="inline" size={16} />
                                    Loading...
                                </span>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Load Data
                                </>
                            )}                        </button>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bill ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-10">
                                        <Loader variant="section" message="Fetching bills..." />
                                    </td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                        No records found. Select a date range to load bills.
                                    </td>
                                </tr>
                            ) : (
                                bills.map(b => (
                                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors group">

                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                #{b.billNo || b.invoiceNumber || b._id.slice(-6)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${b.type === "Restaurant"
                                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                }`}>
                                                {b.type === "Restaurant"
                                                    ? <Utensils className="w-3 h-3" />
                                                    : <BedDouble className="w-3 h-3" />
                                                }
                                                {b.type}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            ₹{Number(b.displayAmount || 0).toLocaleString()}
                                        </td>

                                        <td className="px-6 py-4">
                                            {b.edited ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight bg-yellow-100 text-yellow-700">
                                                    Edited
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Original</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setEditing(b)}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <FileEdit className="w-3.5 h-3.5" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handlePrint(b)}
                                                className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-green-50"
                                            >
                                                Print
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

                    {/* MODAL CONTAINER */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* MODAL HEADER */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${editing.type === 'Restaurant' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {editing.type === 'Restaurant' ? <Utensils className="w-5 h-5" /> : <BedDouble className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">Edit {editing.type} Bill</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">ID: {editing._id.slice(-8)}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* MODAL CONTENT */}
                        <div className="p-6 overflow-y-auto space-y-8 flex-1">

                            {/* RESTAURANT LAYOUT */}
                            {editing.type === "Restaurant" && (
                                <>
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Customer Details</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClasses}>Name</label>
                                                <input
                                                    value={editing.customer?.name || ""}
                                                    onChange={e => setEditing({ ...editing, customer: { ...editing.customer, name: e.target.value } })}
                                                    placeholder="e.g. John Doe"
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Phone Number</label>
                                                <input
                                                    value={editing.customer?.phone || ""}
                                                    onChange={e => setEditing({ ...editing, customer: { ...editing.customer, phone: e.target.value } })}
                                                    placeholder="+91..."
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Order Items</h4>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase px-1">
                                                <div className="col-span-6">Item Name</div>
                                                <div className="col-span-2 text-center">Price</div>
                                                <div className="col-span-2 text-center">Qty</div>
                                                <div className="col-span-2 text-right">Total</div>
                                            </div>
                                            {editing.items.map((item, i) => (
                                                <div key={i} className="grid grid-cols-12 gap-2 items-center">

                                                    {/* Name */}
                                                    <div className="col-span-5">
                                                        <input
                                                            value={item.name}
                                                            list="itemsList"
                                                            onChange={e => {
                                                                const items = [...editing.items];
                                                                items[i].name = e.target.value;

                                                                // 🔥 AUTO PRICE FILL
                                                                const found = menuItems.find(m => m.name === e.target.value);
                                                                if (found) {
                                                                    items[i].price = found.price;
                                                                }

                                                                setEditing({ ...editing, items });
                                                            }}
                                                            className={inputClasses}
                                                        />

                                                        {/* 🔥 SUGGESTION LIST */}
                                                        <datalist id="itemsList">
                                                            {menuItems.map((m, idx) => (
                                                                <option key={idx} value={m.name} />
                                                            ))}
                                                        </datalist>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="col-span-2">
                                                        <input
                                                            type="number"
                                                            value={item.price || 0}
                                                            onChange={e => {
                                                                const items = [...editing.items];
                                                                items[i].price = Number(e.target.value);
                                                                setEditing({ ...editing, items });
                                                            }}
                                                            className={`${inputClasses} text-center`}
                                                        />
                                                    </div>

                                                    {/* Qty */}
                                                    <div className="col-span-2">
                                                        <input
                                                            type="number"
                                                            value={item.qty || 1}
                                                            onChange={e => {
                                                                const items = [...editing.items];
                                                                items[i].qty = Number(e.target.value);
                                                                setEditing({ ...editing, items });
                                                            }}
                                                            className={`${inputClasses} text-center`}
                                                        />
                                                    </div>

                                                    {/* Total */}
                                                    <div className="col-span-2 text-right text-sm font-semibold text-slate-700">
                                                        ₹{(item.price || 0) * (item.qty || 1)}
                                                    </div>

                                                    {/* Delete */}
                                                    <div className="col-span-1 flex justify-end">
                                                        <button
                                                            onClick={() => {
                                                                const items = editing.items.filter((_, index) => index !== i);
                                                                setEditing({ ...editing, items });
                                                            }}
                                                            className="text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newItem = {
                                                        name: "",
                                                        price: 0,
                                                        qty: 1
                                                    };

                                                    setEditing({
                                                        ...editing,
                                                        items: [...editing.items, newItem]
                                                    });
                                                }}
                                                className="mt-4 w-full text-sm bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-medium transition-all"
                                            >
                                                + Add Item
                                            </button>
                                        </div>
                                    </section>

                                    <section className="pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClasses}>Discount</label>
                                                <div className="relative">
                                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        value={editing.discount || 0}
                                                        onChange={e => setEditing({ ...editing, discount: Number(e.target.value) })}
                                                        className={`${inputClasses} pl-8`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Payment Mode</label>
                                                <select
                                                    value={editing.paymentMode}
                                                    onChange={e => setEditing({ ...editing, paymentMode: e.target.value })}
                                                    className={inputClasses}
                                                >
                                                    <option>CASH</option>
                                                    <option>UPI</option>
                                                    <option>CARD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* ROOM LAYOUT */}
                            {editing.type === "Room" && (
                                <>
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Guest Information</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={labelClasses}>Guest Name</label>
                                                <input
                                                    value={editing.guestName || ""}
                                                    onChange={e => setEditing({ ...editing, guestName: e.target.value })}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClasses}>Room Number</label>
                                                    <input
                                                        value={editing.roomNo || ""}
                                                        onChange={e => setEditing({ ...editing, roomNo: e.target.value })}
                                                        className={inputClasses}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <IndianRupee className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Charges & Billing</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClasses}>Room Price / Night</label>
                                                <input
                                                    type="number"
                                                    value={editing.roomPrice || 0}
                                                    onChange={e => setEditing({ ...editing, roomPrice: Number(e.target.value) })}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Food Charges</label>
                                                <input
                                                    type="number"
                                                    value={editing.foodTotal || 0}
                                                    onChange={e => setEditing({ ...editing, foodTotal: Number(e.target.value) })}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Payment Details</h4>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Payment Method</label>
                                            <select
                                                value={editing.paymentMethod || "Cash"}
                                                onChange={e => setEditing({ ...editing, paymentMethod: e.target.value })}
                                                className={inputClasses}
                                            >
                                                <option>Cash</option>
                                                <option>UPI</option>
                                                <option>Card</option>
                                            </select>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">Grand Total</span>
                                <span className="text-lg font-extrabold text-slate-800">
                                    ₹{editing.type === "Restaurant"
                                        ? (() => {
                                            const subtotal = editing.items.reduce(
                                                (acc, i) => acc + ((i.price || 0) * (i.qty || 1)),
                                                0
                                            );

                                            const discount = editing.discount || 0;
                                            const afterDiscount = subtotal - discount;

                                            const gstPercent = editing.gstPercent || 0;
                                            const gstAmount = (afterDiscount * gstPercent) / 100;

                                            const finalAmount = Math.round(afterDiscount + gstAmount);

                                            return finalAmount.toLocaleString();
                                        })()
                                        : (
                                            (editing.roomPrice || 0) * (editing.nights || 1) +
                                            (editing.foodTotal || 0)
                                        ).toLocaleString()
                                    }
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* this is for bills printing  */}
            {printBill && (
                <div className="print-area hidden print:block">
                    {printBill.type === "Room" ? (
                        <A4RoomBill booking={printBill} />
                    ) : (
                        formattedBill && <RestaurantThermalBill {...formattedBill} />
                    )}
                </div>
            )}
        </div>
    )
}