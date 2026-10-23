import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function VerificationBadge({ status, size = "md" }) {
  const configs = {
    VERIFIED: {
      label: "VERIFIED",
      sub: "Merchant Record Match",
      bg: "bg-emerald-950/50 border-emerald-500/50 text-emerald-400 cyber-glow-green",
      icon: CheckCircle2,
    },
    MISMATCH: {
      label: "AMOUNT MISMATCH",
      sub: "Conflicting Ledger Data",
      bg: "bg-rose-950/60 border-rose-500/60 text-rose-400 cyber-glow-red animate-pulse",
      icon: ShieldAlert,
    },
    "NOT FOUND": {
      label: "UNVERIFIED / NOT FOUND",
      sub: "No Bank Ledger Credit",
      bg: "bg-amber-950/50 border-amber-500/50 text-amber-400",
      icon: AlertTriangle,
    },
    INCONCLUSIVE: {
      label: "INCONCLUSIVE",
      sub: "Missing / Obscured UTR",
      bg: "bg-slate-900 border-slate-600 text-slate-300",
      icon: HelpCircle,
    },
  };

  const config = configs[status] || configs["INCONCLUSIVE"];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-3",
  };

  return (
    <div className={`inline-flex items-center rounded-lg border font-mono tracking-wide ${config.bg} ${sizeClasses[size]}`}>
      <Icon className={size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <div>
        <div className="font-bold leading-none">{config.label}</div>
        {size === "lg" && <div className="text-xs opacity-75 mt-0.5">{config.sub}</div>}
      </div>
    </div>
  );
}
