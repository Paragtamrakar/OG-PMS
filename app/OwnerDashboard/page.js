"use client";

import React, { useState, useEffect } from 'react';
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
    Loader2,
    ArrowUpRight,
    Filter,
    Inbox,
    Zap,
    PieChart as PieChartIcon
} from 'lucide-react';

// --- Core Helper Functions ---
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
    return past.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const useCountUp = (end, duration = 1000, dependencies = []) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * end));
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }, [end, ...dependencies]);
    return count;
};

// --- Modern UI Components ---

const Skeleton = ({ className }) => (
    <div className={`relative overflow-hidden bg-slate-200/50 rounded-3xl ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
);

const SummaryCard = ({ title, value, icon: Icon, colorClass }) => {
    const animatedValue = useCountUp(value, 1500, [value]);

    const variants = {
        'bg-blue-500': { bg: 'bg-blue-50', icon: 'text-blue-600', dot: 'bg-blue-600' },
        'bg-indigo-500': { bg: 'bg-indigo-50', icon: 'text-indigo-600', dot: 'bg-indigo-600' },
        'bg-orange-500': { bg: 'bg-orange-50', icon: 'text-orange-600', dot: 'bg-orange-600' },
        'bg-emerald-500': { bg: 'bg-emerald-50', icon: 'text-emerald-600', dot: 'bg-emerald-600' },
    };

    const style = variants[colorClass] || variants['bg-blue-500'];

    return (
        <div className="group relative p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${style.bg} ${style.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                    Active
                </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                ₹{animatedValue.toLocaleString('en-IN')}
            </h3>
        </div>
    );
};

const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="h-48 flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Trend Data</p>
        </div>
    );

    const max = Math.max(...data.map(d => d.value)) || 1;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / max) * 75 - 15
    }));

    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className="w-full h-48 mt-8 relative group">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} L 100,100 L 0,100 Z`} fill="url(#chartFill)" />
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="white" stroke="#3b82f6" strokeWidth="2" className="transition-all duration-300 group-hover:r-2.5" />
                ))}
            </svg>
            <div className="flex justify-between mt-6 px-1 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <span>{data[0].label}</span>
                <span className="text-slate-200">|</span>
                <span>{data[data.length - 1].label}</span>
            </div>
        </div>
    );
};

const SimplePieChart = ({ room, food }) => {
    const total = room + food;
    if (total === 0) return <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">No Mix Data</div>;
    const roomPerc = (room / total) * 100;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-10 py-4">
            <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f8fafc" strokeWidth="5" />
                    <circle
                        cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="5"
                        strokeDasharray={`${roomPerc} ${100 - roomPerc}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(roomPerc)}%</span>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Rooms</span>
                </div>
            </div>
            <div className="w-full space-y-5">
                {[
                    { label: 'Lodging Revenue', value: room, color: 'bg-blue-600', perc: roomPerc },
                    { label: 'Food & Service', value: food, color: 'bg-slate-300', perc: 100 - roomPerc }
                ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span>{item.label}</span>
                            <span className="text-slate-900">₹{item.value.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.perc}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Application ---

export default function App() {
    const [dates, setDates] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const transformData = (apiData) => ({
        ...apiData,
        dailyData: apiData.dailyData?.map(item => ({
            label: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            value: item.revenue
        })) || [],
        recentActivity: apiData.recentActivity || []
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/reports?from=${dates.from}&to=${dates.to}&includeActivity=true`);
            if (!res.ok) throw new Error("API Error");
            const result = await res.json();
            setData(transformData(result));
            setIsFilterOpen(false);
        } catch (err) {
            setError("Server connection lost. Retrying...");
            setTimeout(fetchData, 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplyFilter = () => fetchData();

    return (
        <div className="min-h-screen bg-[#fcfdfe] pb-28 font-sans text-slate-900">
            <style>{`
                @keyframes shimmer { 100% { transform: translateX(200%); } }
                .glass-header { background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(180%) blur(20px); }
            `}</style>

            {/* Premium Navigation Header */}
            <header className="sticky top-0 z-50 glass-header border-b border-slate-100/50 px-6 py-4 flex justify-between items-center shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-slate-200">
                                <span className="text-white font-black text-sm tracking-tight">OG</span>
                            </div>

                            <div>
                                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none mb-1 flex items-center gap-1">
                                    <span>OG</span>
                                    <span className="text-emerald-500">PMS</span>
                                </h1>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                    Smart Hotel Dashboard
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-3 rounded-2xl border transition-all duration-300 ${isFilterOpen ? 'bg-slate-900 border-slate-900 text-white rotate-90 shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">

                {/* Intelligent Filter Overlay */}
                {isFilterOpen && (
                    <section className="bg-white p-7 rounded-[3rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Timezone & Range</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">&times;</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Start</label>
                                <input
                                    type="date"
                                    value={dates.from}
                                    onChange={(e) => setDates({ ...dates, from: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period End</label>
                                <input
                                    type="date"
                                    value={dates.to}
                                    onChange={(e) => setDates({ ...dates, to: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleApplyFilter}
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Refresh Analytics"}
                        </button>
                    </section>
                )}

                {/* THE MORNING BRIEF (Insight First) */}
                <section className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/30 rounded-full blur-[100px] -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] -ml-20 -mb-20" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Analysis Complete</span>
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                {loading ? "Syncing..." : `Welcome back.`}
                            </h2>
                            <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                                {data ? (
                                    <>
                                        You've accrued <span className="text-white font-bold underline decoration-blue-500 decoration-2 underline-offset-4">₹{data.totalRevenue.toLocaleString()}</span> this period.
                                        Most of this growth came from <span className="text-blue-400 font-bold">Lodging</span>, which grew consistently over the last 7 days.
                                    </>
                                ) : "Identifying your primary revenue drivers for this selection..."}
                            </p>
                        </div>

                        <div className="hidden lg:flex flex-col items-end text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Performance Index</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">94</span>
                                <span className="text-emerald-400 font-bold">/100</span>
                            </div>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-4 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Summary Metrics Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                    ) : data ? (
                        <>
                            <SummaryCard title="Gross Earnings" value={data.totalRevenue} icon={TrendingUp} colorClass="bg-blue-500" />
                            <SummaryCard title="Room Sales" value={data.roomRevenue} icon={Bed} colorClass="bg-indigo-500" />
                            <SummaryCard title="F&B Revenue" value={data.foodRevenue} icon={Utensils} colorClass="bg-orange-500" />
                            <SummaryCard title="Tax Payable" value={data.gstCollected} icon={Receipt} colorClass="bg-emerald-500" />
                        </>
                    ) : null}
                </section>

                {/* Analytics Deep-Dive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Growth Trend */}
                    <section className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div>
                                <h4 className="text-base font-black text-slate-900 tracking-tight">Growth Trajectory</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Volume vs Time</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-2xl">
                                <ArrowUpRight className="w-4 h-4 text-blue-600" />
                                <span className="text-[10px] font-black text-blue-600 uppercase">Above Avg</span>
                            </div>
                        </div>
                        {loading ? <Skeleton className="h-56 w-full mt-10" /> : <SimpleLineChart data={data?.dailyData} />}
                    </section>

                    {/* Revenue Mix Breakdown */}
                    <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <PieChartIcon className="w-4 h-4 text-slate-400" />
                            <h4 className="text-base font-black text-slate-900 tracking-tight">Revenue Mix</h4>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Departmental Share</p>
                        {loading ? <Skeleton className="h-56 w-full" /> : <SimplePieChart room={data?.roomRevenue} food={data?.foodRevenue} />}
                    </section>
                </div>

                {/* Operations & Exports Footer Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    {/* Live Stream of Transactions */}
                    <section className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h4 className="text-base font-black text-slate-900">Live Activity</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time log</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                            ) : data?.recentActivity.length > 0 ? (
                                data.recentActivity.map((activity) => (
                                    <div key={activity.id} className="group flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-[2rem] transition-all duration-500 border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${activity.type === 'Bill' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {activity.type === 'Bill' ? <Utensils className="w-6 h-6" /> : <Bed className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 mb-1">{activity.desc}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${activity.type === 'Bill' ? 'bg-orange-200/40 text-orange-700' : 'bg-indigo-200/40 text-indigo-700'}`}>{activity.type}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{getTimeAgo(activity.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-black text-emerald-600 tracking-tight">+₹{activity.amount.toLocaleString()}</p>
                                            <ChevronRight className="w-5 h-5 text-slate-200 ml-auto mt-2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                    <Inbox className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">No Records Found</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Report Exports (Low Priority but High Utility) */}
                    <section className="space-y-6">
                        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Download className="w-20 h-20 text-slate-900" />
                            </div>
                            <h4 className="text-base font-black text-slate-900 mb-2">Export Hub</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">Document your growth</p>

                            <div className="space-y-4 relative z-10">
                                <button
                                    onClick={() => window.open(`/api/reports/export?from=${dates.from}&to=${dates.to}`)}
                                    className="w-full flex items-center justify-between p-5 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xl shadow-blue-200 active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <Download className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-[0.1em]">Excel Format</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </button>
                                <button
                                    onClick={() => window.open(`/api/reports/export?from=${dates.from}&to=${dates.to}&type=pdf`)}
                                    className="w-full flex items-center justify-between p-5 rounded-3xl bg-slate-900 hover:bg-black text-white transition-all shadow-xl shadow-slate-200 active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <FileText className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-[0.1em]">Legal PDF Audit</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}