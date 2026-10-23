import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ShieldCheck, AlertTriangle, ShieldAlert, 
  HelpCircle, RefreshCw, Activity, ArrowUpRight, Download, Eye
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend 
} from 'recharts';
import { getDashboardMetrics, getReportPdfUrl } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';

export default function DashboardPage({ setActiveTab, setInspectedRecord }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardMetrics();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <div className="font-mono text-cyan-300 text-sm tracking-wider uppercase">
          Aggregating Forensic Telemetry...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 max-w-md mx-auto">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <div className="font-bold">Error Loading Dashboard</div>
          <p className="text-xs text-rose-200 mt-1">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 rounded-lg bg-rose-900 text-white text-xs font-mono font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Analyzed",
      value: data.total_scans,
      sub: "Uploaded Screenshots",
      color: "text-white",
      border: "border-slate-800",
      icon: Activity,
    },
    {
      label: "Verified Matches",
      value: data.verified_count,
      sub: "Confirmed by Ledger",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: ShieldCheck,
    },
    {
      label: "Critical Mismatches",
      value: data.mismatch_count,
      sub: "Tampered Amounts Flagged",
      color: "text-rose-400",
      border: "border-rose-500/30",
      icon: ShieldAlert,
    },
    {
      label: "Unverified / Not Found",
      value: data.not_found_count,
      sub: "No Bank Ledger Entry",
      color: "text-amber-400",
      border: "border-amber-500/30",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>CYBERSECURITY INCIDENT TELEMETRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Fraud Analytics & Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time heuristic risk trends, verification distribution, and audit log telemetry.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="self-start sm:self-auto px-4 py-2 rounded-xl glass-panel text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-5 rounded-2xl border ${card.border} space-y-2`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`text-3xl font-extrabold font-mono ${card.color}`}>
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recharts Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Status Distribution (Donut Chart) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Verification Breakdown
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              Avg Suspicion: {data.average_suspicion_score}/100
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {data.status_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
                <span className="font-bold text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Scan Volume & Flagged Trends (AreaChart) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Scan Activity & Anomaly Rate
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_trend}>
                <defs>
                  <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scanned"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScanned)"
                  name="Total Scans"
                />
                <Area
                  type="monotone"
                  dataKey="flagged"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFlagged)"
                  name="Flagged Issues"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-cyan-400 rounded" />
              <span>Total Scans</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-rose-500 rounded" />
              <span>Flagged / Suspicious</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Verification History Feed */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              Recent Forensic Verifications
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest screenshot submissions processed by the PayShield AI engine.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("history")}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">EXTRACTED UTR</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">SUSPICION</th>
                <th className="py-3 px-4 text-right">AUDIT REPORT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recent_records && data.recent_records.length > 0 ? (
                data.recent_records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">
                      {rec.created_at ? new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <VerificationBadge status={rec.verification_status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-200 select-all">
                      {rec.extracted_utr || "Unrecognized"}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {rec.extracted_amount !== null ? `₹${rec.extracted_amount.toLocaleString('en-IN')}` : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        rec.suspicion_score <= 29 ? "text-emerald-400 bg-emerald-950/60" :
                        rec.suspicion_score <= 69 ? "text-amber-400 bg-amber-950/60" :
                        "text-rose-400 bg-rose-950/60"
                      }`}>
                        {rec.suspicion_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={getReportPdfUrl(rec.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-mono">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
