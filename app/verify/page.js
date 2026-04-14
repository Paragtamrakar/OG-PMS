"use client";

import { useState } from "react";
import Navbar from "@/Components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VerifyPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    async function searchGuest() {
        if (!query) return;

        setLoading(true);

        const res = await fetch(`/api/guest-search?q=${query}`);
        if (!res.ok) {
            const text = await res.text();
            console.error("API ERROR:", text);
            alert("Failed to fetch police register");
            return;
        }

        const data = await res.json();


        setResults(data);
        setLoading(false);
    }
    async function downloadRegister() {

        if (!fromDate || !toDate) {
            alert("Select date range");
            return;
        }

        const res = await fetch(`/api/police-register?from=${fromDate}&to=${toDate}`);
        const data = await res.json();

        const doc = new jsPDF("l", "mm", "a4");

        doc.setFontSize(16);
        doc.text("HOTELOG-PMS ", 14, 12);

        doc.setFontSize(12);
        doc.text("Police Guest Register", 14, 18);

        doc.setFontSize(10);
        doc.text(`From: ${fromDate}   To: ${toDate}`, 14, 24);

        const rows = [];

       (data.invoices || []).forEach((inv) => {

    // 🔥 booking match karo
    const booking = (data.bookings || []).find(
        (b) => String(b._id) === String(inv.bookingId)
    );

    const otherGuests = booking?.guests?.length
        ? booking.guests.map(g => `${g.name} (${g.idType}:${g.idNumber})`).join(", ")
        : "-";

    rows.push([
        inv.invoiceNumber, // ✅ invoice
        booking?.roomSnapshot?.roomNo || inv.roomNo,
        booking?.guest?.name || inv.guestName,
        booking?.guest?.fatherName || "-",
        booking?.guest?.phone || "-",
        booking?.guest?.address || "-",
        booking?.guest?.vehicleNumber || "-",
        booking?.guest?.fromCity || "-",
        booking?.guest?.purposeOfVisit || "-",
        booking?.guest?.idType || "-",
        booking?.guest?.idNumber || "-",
        otherGuests,
        new Date(inv.checkIn).toLocaleDateString(),
        new Date(inv.checkOut).toLocaleDateString() // ✅ actual
    ]);
});

        rows.sort((a, b) => {
            return new Date(a[12]) - new Date(b[12]); // checkIn index = 12
        });

        autoTable(doc, {
            startY: 28,

            head: [[
                "Booking",
                "Room",
                "Primary Guest",
                "Father",
                "Phone",
                "Address",
                "Vehicle",
                "From",
                "Purpose",
                "ID Type",
                "ID Number",
                "Other Guests",
                "CheckIn",
                "CheckOut"
            ]],

            body: rows,

            styles: {
                fontSize: 7,
                cellPadding: 3,
                overflow: "linebreak",
                valign: "middle"
            },

            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                halign: "center"
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            tableWidth: "auto"
        });

        doc.save(`police-register-${fromDate}-to-${toDate}.pdf`);
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                        Guest Verification
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Search and verify guest details across current and upcoming bookings.
                    </p>
                </header>

                {/* Search Zone */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
                    <div className="max-w-2xl">
                        <label htmlFor="search" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Quick Search
                        </label>
                        <div className="flex shadow-sm rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <input
                                id="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search Name, Phone Number, or ID..."
                                className="w-full px-4 py-3 text-slate-700 outline-none placeholder:text-slate-400"
                            />
                            <button
                                onClick={searchGuest}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-medium transition-colors border-l border-indigo-700"
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Export Police Register */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">

                    <h2 className="text-sm font-semibold text-slate-700 mb-4">
                        Export Police Register
                    </h2>

                    <div className="flex flex-wrap items-end gap-4">

                        <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-500 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-500 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <button
                            onClick={downloadRegister}
                            className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium"
                        >
                            Export Police Register
                        </button>

                    </div>

                </section>
                {/* Results Area */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-medium text-slate-700">Verification Results</h2>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {results.length} record{results.length !== 1 ? 's' : ''} found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Guest Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Identification</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Room</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Stay Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {results.length > 0 ? (
                                    results.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-slate-900">{r.guestName}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{r.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-medium text-slate-400 uppercase">{r.idType}</div>
                                                <div className="text-sm text-slate-700 font-mono">{r.idNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded text-sm border border-indigo-100">
                                                    {r.roomNo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                                                    <span><span className="text-slate-400 w-8 inline-block">IN:</span> {new Date(r.checkIn).toLocaleDateString()}</span>
                                                    <span><span className="text-slate-400 w-8 inline-block">OUT:</span> {new Date(r.checkOut).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${r.status === 'Verified' || r.status === 'Checked In'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            {loading ? (
                                                <div className="flex flex-col items-center animate-pulse">
                                                    <div className="h-10 w-10 bg-slate-200 rounded-full mb-4"></div>
                                                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic flex flex-col items-center">
                                                    <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <p>No guest records found. Enter a name or phone number to begin.</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}