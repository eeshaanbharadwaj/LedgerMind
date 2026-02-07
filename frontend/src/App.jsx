import { useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    PieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';

// Simple reusable card component
const SummaryCard = ({ title, value, color, borderColor }) => (
    <div className={`bg-card p-6 rounded-2xl border ${borderColor} shadow-lg backdrop-blur-sm relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            {/* Decorative subtle icon or shape could go here */}
            <div className="w-16 h-16 rounded-full bg-current text-white mix-blend-overlay"></div>
        </div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className={`text-4xl font-extrabold mt-2 ${color} drop-shadow-sm`}>{value}</p>
    </div>
);

function App() {
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
        setError(null); // Clear previous errors
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

    // Filter results based on search term
    const filteredResults = data?.results ? data.results.filter(acc =>
        acc.AccountID.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const chartData = [...filteredResults].sort((a, b) => a.Trust_Score - b.Trust_Score);

    // Pie Chart Data
    const pieData = [
        { name: 'High Risk', value: data?.summary.high_risk_accounts || 0, color: '#ef4444' },
        { name: 'Low Risk', value: data?.summary.low_risk_accounts || 0, color: '#14b8a6' },
    ];

    return (
        <div className="min-h-screen bg-darker text-gray-200 p-8 font-sans selection:bg-primary selection:text-white">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        LedgerMind
                    </h1>
                    <p className="text-lg text-gray-400">
                        Behavior-Based Transaction Trust Scoring System
                    </p>
                </header>

                {/* Input Section */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-full max-w-lg p-8 bg-card rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-lg transform transition-all hover:scale-[1.01]">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Upload Transaction CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                cursor-pointer border border-gray-600 rounded-lg p-2 bg-dark/50"
                        />
                        {error && <p className="mt-4 text-red-400 text-sm font-semibold animate-pulse">{error}</p>}

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform
                ${loading
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/50 hover:scale-105 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : "Analyze Behavior"}
                        </button>
                    </div>
                </div>

                {/* Dashboard Results */}
                {data && (
                    <div className="space-y-8 animate-fade-in-up">

                        {/* Search and Action Bar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-gray-700/50">
                            <div className="relative w-full md:w-96">
                                <input
                                    type="text"
                                    placeholder="Search Account ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark/50 border border-gray-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <button
                                onClick={downloadReport}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download Report
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Total Accounts"
                                value={data.summary.total_accounts}
                                color="text-blue-400"
                                borderColor="border-blue-500/30"
                            />
                            <SummaryCard
                                title="Low Risk Accounts"
                                value={data.summary.low_risk_accounts}
                                color="text-green-400"
                                borderColor="border-green-500/30"
                            />
                            <SummaryCard
                                title="High Risk Accounts"
                                value={data.summary.high_risk_accounts}
                                color="text-red-400"
                                borderColor="border-red-500/30"
                            />
                        </div>

                        {/* AI Insights Section */}
                        <div className="bg-card p-6 rounded-2xl border border-primary/20 shadow-xl bg-gradient-to-br from-card to-primary/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-200">AI Auditor Suggestions</h2>
                                </div>
                                <button
                                    onClick={getAIInsights}
                                    disabled={aiLoading}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${aiLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20'}`}
                                >
                                    {aiLoading ? 'Analyzing...' : aiInsights ? 'Regenerate Insights' : 'Get AI Insights'}
                                </button>
                            </div>

                            {aiInsights ? (
                                <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed animate-fade-in">
                                    {aiInsights.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">
                                    Click the button to generate AI-powered forensic suggestions based on the current analysis.
                                </p>
                            )}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bar Chart */}
                            <div className="bg-card p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                                <h2 className="text-xl font-bold mb-6 text-gray-200">Trust Scores</h2>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="AccountID" stroke="#94a3b8" fontSize={10} />
                                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                            <Bar dataKey="Trust_Score" fill="#14b8a6">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.Trust_Score < 50 ? '#ef4444' : '#14b8a6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie Chart & Scatter Plot Container */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-card p-6 rounded-2xl border border-gray-700/50 shadow-xl flex items-center justify-around">
                                    <div className="w-1/2 h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2">
                                        {pieData.map(d => (
                                            <div key={d.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                                <span className="text-sm text-gray-400">{d.name}: {d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Behavior Analysis Plot */}
                        <div className="bg-card p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 text-gray-200">Behavior Analysis (Total Volume vs Count)</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid stroke="#334155" />
                                        <XAxis type="number" dataKey="Txn_Count" name="Txn Count" stroke="#94a3b8" label={{ value: 'Txn Count', position: 'bottom', fill: '#94a3b8' }} />
                                        <YAxis type="number" dataKey="Total_Volume" name="Volume" stroke="#94a3b8" label={{ value: 'Volume ($)', angle: -90, position: 'left', fill: '#94a3b8' }} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Accounts" data={filteredResults}>
                                            {filteredResults.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.Trust_Score < 50 ? '#ef4444' : '#14b8a6'} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-card rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-700/50">
                                <h2 className="text-xl font-bold text-gray-200">Detailed Risk Analysis</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-dark/50 text-gray-200 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Account ID</th>
                                            <th className="px-6 py-4">Avg Amt</th>
                                            <th className="px-6 py-4">Max Amt</th>
                                            <th className="px-6 py-4">Total Vol</th>
                                            <th className="px-6 py-4">Z-Score</th>
                                            <th className="px-6 py-4">Trust Score</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {chartData.map((row) => (
                                            <tr key={row.AccountID} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-gray-300">{row.AccountID}</td>
                                                <td className="px-6 py-4">${row.Avg_Amount}</td>
                                                <td className="px-6 py-4">${row.Max_Amount}</td>
                                                <td className="px-6 py-4">${row.Total_Volume}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`${Math.abs(row.Z_Score) > 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                                                        {row.Z_Score}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    <span className={`${row.Trust_Score < 50 ? 'text-red-400' : 'text-primary'}`}>
                                                        {row.Trust_Score}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${row.Risk_Level === 'High Risk'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                                        }`}>
                                                        {row.Risk_Level.toUpperCase()}
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
            </div>
        </div>
    );
}

export default App;
