import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

export default function RiskMeter({ score = 0, level = "LOW" }) {
  // Score 0-100
  const normalizedScore = Math.min(100, Math.max(0, score));

  const getColor = (s) => {
    if (s <= 29) return { color: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500", label: "LOW RISK" };
    if (s <= 69) return { color: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500", label: "MEDIUM SUSPICION" };
    return { color: "#ef4444", text: "text-rose-500", bg: "bg-rose-500", label: "HIGH ALERT" };
  };

  const current = getColor(normalizedScore);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {normalizedScore <= 29 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : normalizedScore <= 69 ? (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" />
          )}
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Heuristic Suspicion Index
          </span>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${current.text} bg-slate-900 border border-current`}>
          {current.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
          {normalizedScore}
        </span>
        <span className="text-slate-400 text-sm font-mono">/ 100</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 border border-slate-700/50 mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${current.bg}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-3">
        <span>0 (Genuine Record)</span>
        <span>50 (Unverified)</span>
        <span>100 (Critical Tamper)</span>
      </div>

      <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2.5 leading-relaxed">
        <strong className="text-slate-300">Notice:</strong> Score reflects heuristic visual and transaction inconsistency indicators, not bank confirmation.
      </p>
    </div>
  );
}
