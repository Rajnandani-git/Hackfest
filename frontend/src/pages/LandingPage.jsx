import React from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Search, FileText, 
  Layers, Lock, Cpu, ArrowRight, Eye, Smartphone, Zap, 
  BarChart3, RefreshCw, AlertOctagon 
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Hackathon Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 cyber-glow-cyan shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>HACKFEST HACKATHON 2026 • PRESENTED BY OSEN • POWERED BY CRAFTORA</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Detect Fake UPI Payments. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Verify Before You Trust.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            An intelligent cybersecurity verification platform designed for shopkeepers and small merchants to catch spoofed payment app screenshots, detect image manipulation, and cross-check real merchant settlement ledgers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab("verify")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wide shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 flex items-center gap-2 cyber-glow-cyan"
            >
              <Shield className="w-4 h-4" />
              <span>Verify Screenshot Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab("demo")}
              className="px-6 py-3.5 rounded-xl glass-panel text-white font-medium text-sm border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explore 3-Case Demo Mode</span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 text-slate-300 font-medium text-sm border border-slate-700 hover:text-white transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Analytics Dashboard</span>
            </button>
          </div>

          {/* Core Philosophy Notice */}
          <div className="mt-10 max-w-2xl mx-auto p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed font-mono">
            <strong>Key Cybersecurity Principle:</strong> Screenshot visual inspection alone cannot prove fund receipt. PayShield AI pairs computer vision heuristics with actual merchant bank records to expose fraud.
          </div>
        </div>

        {/* Interactive Feature Demo Showcase Preview */}
        <div className="max-w-5xl mx-auto px-4 mt-14">
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 cyber-glow-blue shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                  Interactive Live Preview
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  How PayShield AI Exposes UPI Fraud
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  Demo 1: Genuine
                </span>
                <span className="px-3 py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                  Demo 2: Spoof APK
                </span>
                <span className="px-3 py-1 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                  Demo 3: 10x Mismatch
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Case 01</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    VERIFIED
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">Genuine ₹850 Payment</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Screen details match UTR 329847192834 in the merchant's live bank ledger. Risk score 5/100.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-900">
                  Action: Safe to release goods
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Case 02</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                    NOT FOUND
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">Fake App Generator ₹1,200</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Screenshot claims success, but UTR 889102938475 does not exist in merchant records.
                </p>
                <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-slate-900">
                  Action: Hold delivery, wait for SMS
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Case 03</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40">
                    MISMATCH
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">Altered ₹5,000 vs ₹500</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customer edited the amount to ₹5,000, but merchant bank account credited only ₹500!
                </p>
                <div className="text-[11px] font-mono text-rose-400 pt-2 border-t border-slate-900">
                  Action: Fraud alert, do not hand over goods
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest">
            Pipeline Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Multi-Layered Verification Workflow
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Four specialized stages execute asynchronously to analyze digital forensics, extract entities, and audit bank records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-cyan-400 mb-1">STAGE 01</div>
            <h3 className="text-base font-bold text-white mb-2">Screenshot Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validates MIME type, file size bounds, and calculates SHA-256 + 64-bit perceptual hashes to detect duplicate submissions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 relative">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-blue-400 mb-1">STAGE 02</div>
            <h3 className="text-base font-bold text-white mb-2">Computer Vision & ELA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenCV Error Level Analysis computes compression variance across text regions to spot spliced amounts and modified digits.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-purple-400 mb-1">STAGE 03</div>
            <h3 className="text-base font-bold text-white mb-2">RapidOCR Parsing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts 12-digit UPI reference numbers (UTR), monetary values (₹), payment statuses, and timestamps without external binaries.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-emerald-400 mb-1">STAGE 04</div>
            <h3 className="text-base font-bold text-white mb-2">Ledger Cross-Check</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queries merchant bank transaction ledger. Returns an explainable 0–100 suspicion score and suggested shopkeeper action.
            </p>
          </div>
        </div>
      </section>

      {/* Fraud Awareness Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-rose-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300 mb-4">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>THE GROWING THREAT TO SMALL BUSINESSES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              How Fake UPI Payment Scams Operate
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Fraudsters frequently target busy retail stores, petrol pumps, and restaurants using Android spoof apps (such as fake Paytm/PhonePe generators). These apps create visually indistinguishable receipt screens within seconds, complete with checkmarks and simulated sound effects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">1. Fabricated Transaction ID (UTR)</div>
                <p className="text-slate-400">
                  Scam apps generate fictional 12-digit numbers that were never routed through NPCI or bank servers.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-rose-300 mb-1">2. Spliced Amount Scam</div>
                <p className="text-slate-400">
                  Customer pays ₹1 or ₹50 legitimately to acquire a genuine UTR, then edits the screenshot to show ₹5,000 before showing the merchant.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-amber-300 mb-1">3. Replayed Duplicate Screenshots</div>
                <p className="text-slate-400">
                  Using one legitimate payment screenshot across multiple counters or multiple dates to falsely claim successive purchases.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-emerald-300 mb-1">4. PayShield AI Solution</div>
                <p className="text-slate-400">
                  Automates immediate cross-verification against actual merchant payment feeds to prevent inventory loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest">
            Production-Ready Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Engineering & Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">FastAPI</div>
            <div className="text-xs text-slate-400">Async Python REST</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">RapidOCR</div>
            <div className="text-xs text-slate-400">ONNX Offline Engine</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">OpenCV</div>
            <div className="text-xs text-slate-400">ELA & CV Forensics</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">SQLite</div>
            <div className="text-xs text-slate-400">SQLAlchemy ORM</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">React 19</div>
            <div className="text-xs text-slate-400">Tailwind & Motion</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="font-mono text-cyan-400 font-bold text-base mb-1">ReportLab</div>
            <div className="text-xs text-slate-400">PDF Audit Sheets</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-cyan-500/40 cyber-glow-cyan">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Ready to test PayShield AI?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Upload any UPI payment screenshot or run the instant 3-scenario hackathon demo to witness real-time forensic cross-verification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveTab("verify")}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Start Verification</span>
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className="px-6 py-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 font-medium text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Launch Demo Mode</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
