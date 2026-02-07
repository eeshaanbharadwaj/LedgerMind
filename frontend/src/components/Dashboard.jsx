import { useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    PieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { UserButton } from "@clerk/clerk-react";
import { ArrowUpRight, Upload, Download, Activity, ShieldAlert, Cpu } from 'lucide-react';

// Enhanced Futuristic Card
const SummaryCard = ({ title, value, color, icon: Icon }) => (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-[#0a0a1f]/80 backdrop-blur-md border border-white/5 shadow-[0_0_30px_-5px_contain] hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {Icon && <Icon className="w-16 h-16 text-white" />}
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity blur duration-500"></div>
        <div className="relative z-10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-primary" />}
                {title}
            </h3>
            <p className={`text-4xl font-extrabold mt-1 text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]`}>
                {value}
            </p>
            <div className={`h-1 w-12 mt-4 rounded-full bg-gradient-to-r ${color}`}></div>
        </div>
    </div>
);

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please select a CSV file first.");
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    const getAIInsights = async () => {
        if (!data) return;
        setAiLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://127.0.0.1:5000/ai-insights', data);
            setAiInsights(response.data.insights);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Failed to get AI insights.";
            setError(msg);
        } finally {
            setAiLoading(false);
        }
    };

    const downloadReport = () => {
        if (!data?.results) return;
        const headers = ["AccountID", "Avg_Amount", "Max_Amount", "Total_Volume", "Txn_Count", "Z_Score", "Trust_Score", "Risk_Level"];
        const csvContent = [
            headers.join(","),
            ...data.results.map(row => headers.map(h => row[h]).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LedgerMind_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const filteredResults = data?.results ? data.results.filter(acc =>
        acc.AccountID.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const chartData = [...filteredResults].sort((a, b) => a.Trust_Score - b.Trust_Score);

    const pieData = [
        { name: 'High Risk', value: data?.summary.high_risk_accounts || 0, color: '#ff003c' },
        { name: 'Low Risk', value: data?.summary.low_risk_accounts || 0, color: '#00f0ff' },
    ];

    return (
        <div className="min-h-screen text-gray-200 p-4 md:p-8 font-sans selection:bg-primary selection:text-black">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Top Navigation Bar */}
                <header className="flex justify-between items-center bg-[#0a0a1f]/60 px-6 py-4 rounded-full backdrop-blur-xl border border-white/5 shadow-2xl sticky top-4 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            <Activity className="text-black w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">
                                Ledger<span className="text-primary">Mind</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest hidden md:block">
                                Behavioral Forensics Engine
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </div>
                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: {
                                avatarBox: "w-10 h-10 ring-2 ring-white/10 hover:ring-primary transition-all"
                            }
                        }} />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="space-y-6 pt-4">

                    {/* Welcome/Upload Section */}
                    {!data && (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-fade-in text-center px-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                                <div className="relative p-12 bg-[#0a0a1f] rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                                            <Upload className="w-12 h-12 text-primary" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Upload Transaction Data</h2>
                                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                        Upload your transaction CSV file to initiate the forensic behavioral analysis engine.
                                    </p>

                                    <label className="flex flex-col items-center gap-4 cursor-pointer">
                                        <span className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-primary transition-all w-full text-center truncate">
                                            {file ? file.name : "Select CSV File..."}
                                        </span>
                                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                                    </label>

                                    {error && <p className="mt-4 text-accent text-sm font-bold bg-accent/10 py-2 px-4 rounded-lg inline-block border border-accent/20">{error}</p>}

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading}
                                        className={`w-full mt-8 py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all transform
                                        ${loading
                                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                                : 'bg-primary hover:bg-white hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Processing Matrix...
                                            </span>
                                        ) : "Analyze Data"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Dashboard */}
                    {data && (
                        <div className="grid grid-cols-12 gap-6 animate-fade-in-up">

                            {/* Stats Row */}
                            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <SummaryCard
                                    title="Total Accounts"
                                    value={data.summary.total_accounts}
                                    color="from-blue-500 to-cyan-500"
                                    icon={Activity}
                                />
                                <SummaryCard
                                    title="Low Risk Entities"
                                    value={data.summary.low_risk_accounts}
                                    color="from-primary to-green-400"
                                    icon={ShieldAlert}
                                />
                                <SummaryCard
                                    title="High Risk Entities"
                                    value={data.summary.high_risk_accounts}
                                    color="from-accent to-red-600"
                                    icon={Cpu}
                                />
                            </div>

                            {/* Main Chart Area */}
                            <div className="col-span-12 lg:col-span-8 bg-[#0a0a1f]/80 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Activity className="text-primary w-5 h-5" /> Trust Score Distribution
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-2 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-primary"></span> Safe</span>
                                        <span className="flex items-center gap-2 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-accent"></span> Risky</span>
                                    </div>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ff003c" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#ff003c" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="AccountID" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff40" domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'white', opacity: 0.05 }}
                                                contentStyle={{ backgroundColor: '#050510', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="Trust_Score" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.Trust_Score < 50 ? 'url(#colorRisk)' : 'url(#colorTrust)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Side Panel: Search & Donut */}
                            <div className="col-span-12 lg:col-span-4 space-y-6">
                                {/* Actions */}
                                <div className="bg-[#0a0a1f]/80 p-6 rounded-2xl border border-white/5 shadow-xl">
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search Entity ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                        />
                                        <div className="absolute right-3 top-3.5 text-gray-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadReport}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all group"
                                    >
                                        <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                        Export Forensic Report
                                    </button>
                                </div>

                                {/* Donut Chart */}
                                <div className="bg-[#0a0a1f]/80 p-6 rounded-2xl border border-white/5 shadow-xl min-h-[250px] flex flex-col justify-center items-center relative">
                                    <h3 className="absolute top-6 left-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Risk Ratio</h3>
                                    <div className="w-full h-48 mt-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#050510', border: '1px solid #ffffff20', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-6 w-full px-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">High Risk</p>
                                            <p className="text-xl font-bold text-accent">{((data.summary.high_risk_accounts / data.summary.total_accounts) * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Low Risk</p>
                                            <p className="text-xl font-bold text-primary">{((data.summary.low_risk_accounts / data.summary.total_accounts) * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insights - Full Width */}
                            <div className="col-span-12 bg-gradient-to-br from-[#0a0a1f] to-primary/5 p-8 rounded-2xl border border-primary/20 shadow-[0_0_40px_-10px_rgba(0,240,255,0.1)]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                            <Cpu className="w-6 h-6 text-primary animate-pulse-slow" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">AI Forensic Auditor</h2>
                                            <p className="text-sm text-gray-400">Automated behavioral anomaly detection engine</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={getAIInsights}
                                        disabled={aiLoading}
                                        className={`relative overflow-hidden px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
                                        ${aiLoading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-primary text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)]'}`}
                                    >
                                        {aiLoading ? 'Auditing...' : aiInsights ? 'Re-Audit Data' : 'Run Audit'}
                                    </button>
                                </div>

                                {aiInsights ? (
                                    <div className="prose prose-invert max-w-none text-gray-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {aiInsights.split('\n').filter(line => line.trim().length > 0).map((line, i) => (
                                                <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                                    <span className="text-primary mt-1">▹</span>
                                                    <p className="m-0 text-sm leading-relaxed">{line.replace(/^- /, '')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-xl bg-black/20">
                                        <p className="text-gray-500 text-sm italic">
                                            Initiate the AI Audit to generate forensic suggestions based on the current dataset matrix.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Table */}
                            <div className="col-span-12 bg-[#0a0a1f]/80 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-white">Detailed Ledger Matrix</h2>
                                    <div className="text-xs text-gray-500 font-mono">LIVE_DATA_STREAM</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <thead className="bg-black/40 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Entity ID</th>
                                                <th className="px-6 py-4">Avg Vol</th>
                                                <th className="px-6 py-4">Peak Vol</th>
                                                <th className="px-6 py-4">Total Vol</th>
                                                <th className="px-6 py-4">Z-Delta</th>
                                                <th className="px-6 py-4">Trust Factor</th>
                                                <th className="px-6 py-4 text-right">Risk Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 font-mono">
                                            {chartData.map((row) => (
                                                <tr key={row.AccountID} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="px-6 py-4 font-semibold text-white group-hover:text-primary transition-colors">{row.AccountID}</td>
                                                    <td className="px-6 py-4 text-gray-300 py-3">${Number(row.Avg_Amount).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-gray-300">${Number(row.Max_Amount).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-gray-300">${Number(row.Total_Volume).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`${Math.abs(row.Z_Score) > 2 ? 'text-accent font-bold' : 'text-gray-500'}`}>
                                                            {Number(row.Z_Score).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${row.Trust_Score < 50 ? 'bg-accent' : 'bg-primary'}`}
                                                                    style={{ width: `${row.Trust_Score}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className={`${row.Trust_Score < 50 ? 'text-accent' : 'text-primary'}`}>
                                                                {row.Trust_Score}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${row.Risk_Level === 'High Risk'
                                                            ? 'bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(255,0,60,0.2)]'
                                                            : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                                            }`}>
                                                            {row.Risk_Level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
