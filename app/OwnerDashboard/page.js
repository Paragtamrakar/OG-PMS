"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    Bed,
    Utensils,
    Receipt,
    Calendar,
    Download,
    FileText,
    ChevronRight,
    LayoutDashboard,
    History,
    Settings,
    User,
    AlertCircle,
    Loader2
} from 'lucide-react';


// This is helper function.
const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);

    const diffMs = now - past;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));

    const isToday = now.toDateString() === past.toDateString();

    if (isToday) {
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin} min ago`;
        return `${diffHr} hr ago`;
    }

    if (diffHr < 48) return "Yesterday";

    return past.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
};

// Usecountup is used for number animations
const useCountUp = (end, duration = 1000, dependencies = []) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, ...dependencies]);

    return count;
};

// --- Sub-Components ---

const Skeleton = ({ className }) => (
    <div className={`relative overflow-hidden bg-slate-100 rounded-2xl ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
);

const SummaryCard = ({ title, value, icon: Icon, colorClass, delay }) => {
    const animatedValue = useCountUp(value, 1500, [value]);

    const gradientMap = {
        'bg-blue-500': 'from-blue-50 to-blue-50/30',
        'bg-indigo-500': 'from-indigo-50 to-indigo-50/30',
        'bg-orange-500': 'from-orange-50 to-orange-50/30',
        'bg-emerald-500': 'from-emerald-50 to-emerald-50/30',
    };

    const iconBgMap = {
        'bg-blue-500': 'bg-blue-500/10 ring-1 ring-blue-500/20',
        'bg-indigo-500': 'bg-indigo-500/10 ring-1 ring-indigo-500/20',
        'bg-orange-500': 'bg-orange-500/10 ring-1 ring-orange-500/20',
        'bg-emerald-500': 'bg-emerald-500/10 ring-1 ring-emerald-500/20',
    };

    const textColorMap = {
        'bg-blue-500': 'text-blue-500',
        'bg-indigo-500': 'text-indigo-500',
        'bg-orange-500': 'text-orange-500',
        'bg-emerald-500': 'text-emerald-500',
    };

    return (
        <div
            className={`relative overflow-hidden bg-gradient-to-br ${gradientMap[colorClass] || 'from-slate-50 to-white'} bg-white p-5 rounded-3xl border border-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-default`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
                    <h3 className="text-[1.65rem] font-extrabold text-slate-900 tracking-tight leading-none">
                        ₹{animatedValue.toLocaleString('en-IN')}
                    </h3>
                </div>
                <div className={`p-3 rounded-2xl ${iconBgMap[colorClass] || 'bg-slate-100'} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${textColorMap[colorClass] || 'text-slate-600'}`} />
                </div>
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data.map(d => d.value)) || 1;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / max) * 80 - 10
    }));

    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className="w-full h-48 mt-4 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} L 100,100 L 0,100 Z`} fill="url(#gradient)" />
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#3b82f6" opacity="0.7" />
                ))}
            </svg>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>{data[0].label}</span>
                <span>{data[Math.floor(data.length / 2)].label}</span>
                <span>{data[data.length - 1].label}</span>
            </div>
        </div>
    );
};

const SimplePieChart = ({ room, food }) => {
    const total = room + food;
    if (total === 0) return <div className="h-40 flex items-center justify-center text-slate-300 text-sm font-medium">No data available</div>;

    const roomPerc = (room / total) * 100;

    return (
        <div className="flex items-center gap-8 py-4">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                        cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.5"
                        strokeDasharray={`${roomPerc} ${100 - roomPerc}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Room</span>
                    <span className="text-base font-extrabold text-slate-900">{Math.round(roomPerc)}%</span>
                </div>
            </div>
            <div className="space-y-4 flex-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room Revenue</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 pl-5">₹{room?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 ring-2 ring-slate-300/40" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Food Revenue</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 pl-5">₹{food?.toLocaleString('en-IN') || 0}</p>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function App() {
    const [dates, setDates] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const transformData = (apiData) => {
        return {
            ...apiData,
            dailyData: apiData.dailyData?.map(item => ({
                label: new Date(item.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                }),
                value: item.revenue
            })) || [],
            recentActivity: apiData.recentActivity || []
        };
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/reports?from=${dates.from}&to=${dates.to}&includeActivity=true`
            );

            if (!res.ok) throw new Error("API Error");

            const result = await res.json();
            const formatted = transformData(result);
            setData(formatted);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dates]);

    const handleApplyFilter = () => {
        fetchData();
    };

    return (
        <div className="min-h-screen bg-[#f7f8fa] pb-32 font-sans text-slate-900 selection:bg-blue-100">

            {/* Shimmer keyframe */}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(200%); }
                }
            `}</style>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-30 px-5 py-3.5 flex justify-between items-center shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <div>
                    <a href='/' className="flex items-baseline gap-1.5">
                        <span className="text-slate-900 text-lg font-black tracking-tight">OG</span>
                        <span className="text-emerald-500 text-lg font-black tracking-tight">PMS</span>
                    </a>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold mt-0.5">Business Dashboard</p>
                </div>
                <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center border border-slate-200/80 transition-colors active:scale-95">
                    <User className="w-4 h-4 text-slate-500" />
                </button>
            </header>

            <main className="max-w-4xl mx-auto p-4 pt-5 space-y-5">

                {/* Date Filter Section */}
                <section className="bg-white p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Date Range</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">From</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={dates.from}
                                    onChange={(e) => setDates({ ...dates, from: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-9 pr-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">To</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={dates.to}
                                    onChange={(e) => setDates({ ...dates, to: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-9 pr-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleApplyFilter}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(15,23,42,0.18)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.25)] text-sm tracking-wide"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading…</span>
                            </>
                        ) : (
                            "Apply Filter"
                        )}
                    </button>
                </section>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-500 shadow-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}

                {/* Summary Grid */}
                <section className="grid grid-cols-2 gap-3.5">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                    ) : data ? (
                        <>
                            <SummaryCard title="Total Revenue" value={data.totalRevenue} icon={TrendingUp} colorClass="bg-blue-500" />
                            <SummaryCard title="Room Revenue" value={data.roomRevenue} icon={Bed} colorClass="bg-indigo-500" />
                            <SummaryCard title="Food Revenue" value={data.foodRevenue} icon={Utensils} colorClass="bg-orange-500" />
                            <SummaryCard title="GST Collected" value={data.gstCollected} icon={Receipt} colorClass="bg-emerald-500" />
                        </>
                    ) : (
                        <div className="col-span-full py-14 text-center text-slate-400 text-sm font-medium">No business data found for this range.</div>
                    )}
                </section>

                {/* Visual Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Revenue Trend</h4>
                        </div>
                        {loading ? <Skeleton className="h-48 w-full mt-4" /> : <SimpleLineChart data={data?.dailyData} />}
                    </section>

                    <section className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Revenue Split</h4>
                        </div>
                        {loading ? <Skeleton className="h-48 w-full mt-4" /> : <SimplePieChart room={data?.roomRevenue} food={data?.foodRevenue} />}
                    </section>
                </div>

                {/* Quick Actions */}
                <section className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Quick Exports</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                        <button
                            onClick={() => { window.open(`/api/reports/export?from=${dates.from}&to=${dates.to}`); }}
                            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-blue-50 hover:bg-blue-500 border border-blue-100 hover:border-blue-500 text-blue-500 hover:text-white active:scale-95 transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
                        >
                            <Download className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Export Excel</span>
                        </button>
                        <button
                            onClick={() => { window.open(`/api/reports/export?from=${dates.from}&to=${dates.to}&type=pdf`); }}
                            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-slate-800 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-white active:scale-95 transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(15,23,42,0.22)]"
                        >
                            <FileText className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Export PDF</span>
                        </button>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
                    <div className="flex justify-between items-center mb-5">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recent Activity</h4>
                    </div>
                    <div className="space-y-2.5">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[68px] w-full" />)
                        ) : data?.recentActivity.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between px-4 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl transition-colors duration-150 border border-transparent hover:border-slate-100"
                            >
                                <div className="flex items-center gap-3.5">
                                      <div className="w-10 h-10 rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center flex-shrink-0 border border-slate-100">
                                        {activity.type === 'Bill'
                                            ? <Utensils className="w-4 h-4 text-orange-400" />
                                            : <Bed className="w-4 h-4 text-indigo-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{activity.desc}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{getTimeAgo(activity.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <span className="text-sm font-extrabold text-emerald-600">
                                        +₹{activity.amount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}