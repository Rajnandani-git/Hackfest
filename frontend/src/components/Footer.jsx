import React from 'react';
import { Shield, Lock, Terminal, Cpu, Heart } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                PayShield<span className="text-cyan-400 font-mono">.AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An intelligent fraud detection and merchant settlement cross-verification system built to defend physical retailers against fake UPI payment screenshot generators and spoof apps.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/90 pt-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>PARAKRAM HACKATHON 2026 • THEME 2: CYBER SECURITY & SAFETY</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs uppercase font-mono font-bold text-slate-200 tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setActiveTab("landing")}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Overview & Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("verify")}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Live Screenshot Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("demo")}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Hackathon 3-Case Demo
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Forensic Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("history")}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Audit History
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs uppercase font-mono font-bold text-slate-200 tracking-wider mb-3">
              Forensic Engine
            </h4>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>RapidOCR ONNX Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>OpenCV Error Level Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Merchant Ledger Verification</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-2">
                Problem Statement CS-01: Fake Payment Verification
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="border-t border-slate-900 pt-6 pb-2 text-xs text-slate-400 leading-relaxed text-center">
          <p>
            <strong className="text-slate-400">Security Notice:</strong> PayShield AI provides heuristic suspicion detection and merchant database cross-verification. A screenshot alone cannot legally guarantee receipt of funds. Simulated merchant records represent demo data. Shopkeepers are advised to always verify incoming payments via official merchant soundbox or bank SMS before releasing goods.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>PayShield AI • Verify Before You Trust</span>
            <span>•</span>
            <span>Parakram 2026 Submission</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
