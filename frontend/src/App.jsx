import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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
            // Assuming backend is at localhost:5000
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

    // Prepare chart data: Distribution of Trust Scores
    // We can group scores into buckets or just show account trust scores directly if not too many.
    // For summary, let's just plot Trust Scores of High Risk vs Low Risk or top risky accounts.
    // Let's sort by Trust Score (ascending) to show risky ones first.
    const chartData = data?.results ? [...data.results].sort((a, b) => a.Trust_Score - b.Trust_Score) : [];

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

                        {/* Charts Section */}
                        <div className="bg-card p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 text-gray-200">Trust Score Distribution (Sorted by Risk)</h2>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="AccountID" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }}
                                            itemStyle={{ color: '#f1f5f9' }}
                                            cursor={{ fill: '#334155', opacity: 0.4 }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Trust_Score" name="Trust Score" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.Trust_Score < 50 ? '#ef4444' : '#14b8a6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-card rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-700/50">
                                <h2 className="text-xl font-bold text-gray-200">Account Risk Analysis</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-dark/50 text-gray-200 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Account ID</th>
                                            <th className="px-6 py-4">Avg Amount</th>
                                            <th className="px-6 py-4">Txn Count</th>
                                            <th className="px-6 py-4">Trust Score</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {chartData.map((row) => (
                                            <tr key={row.AccountID} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-gray-300">{row.AccountID}</td>
                                                <td className="px-6 py-4">${row.Avg_Amount.toFixed(2)}</td>
                                                <td className="px-6 py-4">{row.Txn_Count}</td>
                                                <td className="px-6 py-4 font-bold">
                                                    <span className={`${row.Trust_Score < 50 ? 'text-red-400' : 'text-primary'}`}>
                                                        {row.Trust_Score}
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
