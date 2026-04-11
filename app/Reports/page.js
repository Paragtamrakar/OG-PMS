"use client";

import { useState, useEffect, useCallback } from "react";
import EditBills from "@/Components/EditBills"
import Navbar from "@/Components/Navbar";
import Loader from "@/Components/Loader/Loader";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

export default function ReportsDashboard() {
    const [data, setData] = useState(null);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);



    const fetchReport = useCallback(async () => {
        if (!from || !to) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/reports?from=${from}&to=${to}`);
            const result = await res.json();
            setData(result);
        } finally {
            setLoading(false);
        }
    }, [from, to]);





    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-100">
                <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

                    {/* Header & Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                                Business Insights
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Real-time analytics and financial performance overview.
                            </p>
                        </div>
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 flex flex-wrap items-center gap-3">
                            <div className="px-3 py-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                                    Select Date Range
                                </span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        onChange={(e) => setFrom(e.target.value)}
                                        className="text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-medium cursor-pointer"
                                    />
                                    <span className="text-slate-300">—</span>
                                    <input
                                        type="date"
                                        onChange={(e) => setTo(e.target.value)}
                                        className="text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-medium cursor-pointer"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={fetchReport}
                                disabled={loading}
                                className="bg-slate-900 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader variant="inline" size={16} />
                                        Analyzing...
                                    </span>
                                ) : "Analyze"}
                            </button>
                            <button
                                onClick={() => {
                                    if (!from || !to) return alert("Select date range first");

                                    window.open(`/api/reports/export?from=${from}&to=${to}`);
                                }}
                                className="bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl"
                            >
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    {data && data.dailyData?.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">

                            <Card title="Room Revenue" value={data.roomRevenue} />

                            <Card title="Food Revenue" value={data.foodRevenue} />

                            <Card title="GST Collected" value={data.gstCollected} />

                            <Card title="Total Collection" value={data.totalRevenue} />

                        </div>
                    )}


                    {/* Revenue Chart */}
                    {data && data.dailyData?.length > 0 && (

                        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <div className="p-8 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
                                        <p className="text-sm text-slate-500">Daily performance visualization</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                        Gross Revenue
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-4">
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    padding: '12px'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <Loader variant="section" message="Analyzing your business..." />
                    ) : !data ? (
                        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <p className="text-slate-400 font-medium">
                                Select a date range to generate insights
                            </p>
                        </div>
                    ) : null}
                </div>
                <EditBills />
            </div>
        </>
    );
}

function Card({ title, value }) {
    // Format numbers for better readability
    const safeValue = Number(value || 0);

    const formattedValue = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(safeValue);


    return (
        <div className="group bg-white border border-slate-200/60 p-7 rounded-[2rem] shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 ease-out cursor-default">
            <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors">
                {title}
            </p>
            <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-medium text-slate-400">₹</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 group-hover:scale-[1.02] origin-left transition-transform">
                    {formattedValue}
                </h2>
            </div>
            <div className="mt-4 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/10 w-1/3 group-hover:w-full transition-all duration-700 ease-in-out"></div>
            </div>
        </div>

    );
}

