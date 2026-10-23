import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Menu, X, CheckCircle, Database } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState("checking");

  useEffect(() => {
    getHealth()
      .then((data) => {
        if (data.status === "healthy") {
          setSystemStatus("online");
        } else {
          setSystemStatus("degraded");
        }
      })
      .catch(() => setSystemStatus("offline"));
  }, []);

  const navItems = [
    { id: "landing", label: "Overview" },
    { id: "verify", label: "Verify Screenshot" },
    { id: "demo", label: "Demo Mode", badge: "Live Pitch" },
    { id: "dashboard", label: "Analytics" },
    { id: "history", label: "Audit Log" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div 
            onClick={() => setActiveTab("landing")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cyber-glow-cyan shadow-lg">
                <Shield className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-wider text-white">
                  PayShield<span className="text-cyan-400 font-mono">.AI</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  CS-01
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Verify Before You Trust</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === item.id
                    ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 cyber-glow-cyan"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* System Health Status Badge */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                systemStatus === "online"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : systemStatus === "checking"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-slate-300">
              {systemStatus === "online"
                ? "OCR Core Active"
                : systemStatus === "checking"
                ? "Booting AI..."
                : "Engine Offline"}
            </span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
