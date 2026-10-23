import React, { useState } from 'react';
import { 
  Zap, Shield, AlertTriangle, CheckCircle, Download, 
  Terminal, Sparkles, HelpCircle, Layers, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { runDemoPipeline, getReportPdfUrl } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import RiskMeter from '../components/RiskMeter';

export default function DemoModePage({ setActiveTab, setInspectedRecord }) {
  const [activeDemoId, setActiveDemoId] = useState(1);
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const demos = [
    {
      id: 1,
      name: "Demo 1: Genuine Payment",
      tagline: "Matching Merchant Settlement Record",
      expectedBadge: "VERIFIED",
      expectedColor: "emerald",
      amount: "₹850.00",
      utr: "329847192834",
      image: "/demo-files/demo1_genuine.png",
      scenario: "Customer presents a PhonePe UPI payment receipt for ₹850 to 'Sharma General Store'. UTR 329847192834 matches an authorized settlement in the merchant's simulated ICICI bank ledger.",
      judgeTalkingPoints: [
        "Proves zero false-positives for genuine customers.",
        "RapidOCR reliably extracts 12-digit UTR and ₹ amount without external binaries.",
        "Error Level Analysis confirms uniform JPEG compression (no text splicing).",
        "Result: VERIFIED, Risk Score ~5/100, safe to dispatch goods."
      ]
    },
    {
      id: 2,
      name: "Demo 2: Fake Payment Claim",
      tagline: "Spoof Android APK Generator Scam",
      expectedBadge: "NOT FOUND",
      expectedColor: "amber",
      amount: "₹1,200.00",
      utr: "889102938475",
      image: "/demo-files/demo2_fake_claim.png",
      scenario: "Customer shows a seemingly valid Paytm payment screen claiming ₹1,200 was transferred. However, the UTR 889102938475 was fabricated by a spoof APK and never credited to the merchant account.",
      judgeTalkingPoints: [
        "Addresses Problem Statement CS-01 core challenge: screenshot alone != bank credit.",
        "The system does NOT blindly trust the green checkmark.",
        "Identifies that UTR 889102938475 has no corresponding credit in merchant records.",
        "Result: NOT FOUND / UNVERIFIED, Risk Score ~55-65/100, merchant told to wait for bank SMS or Soundbox."
      ]
    },
    {
      id: 3,
      name: "Demo 3: Tampered Amount Mismatch",
      tagline: "Critical Amount Modification (10x Scam)",
      expectedBadge: "MISMATCH",
      expectedColor: "rose",
      amount: "₹5,000.00 (Claims) vs ₹500.00 (Bank)",
      utr: "491028374619",
      image: "/demo-files/demo3_amount_mismatch.png",
      scenario: "Customer made a genuine micro-transaction of ₹500, but edited the screenshot to display ₹5,000 using a photo editing tool to collect high-value merchandise.",
      judgeTalkingPoints: [
        "Crucial defense against digit manipulation: UTR exists, but amount is 10x higher!",
        "OpenCV Error Level Analysis detects localized pixel compression delta around the edited amount.",
        "Cross-verification spots the exact discrepancy: ₹5,000 claimed vs ₹500 ledger.",
        "Result: CRITICAL MISMATCH, Risk Score ~85-94/100, Immediate dispatch hold."
      ]
    }
  ];

  const handleRunDemo = async (demoId) => {
    setLoading(prev => ({ ...prev, [demoId]: true }));
    setErrors(prev => ({ ...prev, [demoId]: null }));

    try {
      const data = await runDemoPipeline(demoId);
      setResults(prev => ({ ...prev, [demoId]: data }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [demoId]: err.message || "Pipeline execution failed" }));
    } finally {
      setLoading(prev => ({ ...prev, [demoId]: false }));
    }
  };

  const currentResult = results[activeDemoId];
  const currentDemo = demos.find(d => d.id === activeDemoId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>HACKATHON LIVE PRESENTATION TESTBENCH</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Live Demonstration Scenarios
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Three standardized verification test vectors processed through the real backend pipeline (RapidOCR, OpenCV, and SQLite merchant ledger). No hardcoded outcomes.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demos.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDemoId(d.id)}
            className={`p-5 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden ${
              activeDemoId === d.id
                ? "bg-slate-900 border-cyan-400 cyber-glow-cyan"
                : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">Scenario {d.id}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                d.expectedBadge === "VERIFIED"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                  : d.expectedBadge === "MISMATCH"
                  ? "bg-rose-950 text-rose-400 border border-rose-500/40"
                  : "bg-amber-950 text-amber-400 border border-amber-500/40"
              }`}>
                {d.expectedBadge}
              </span>
            </div>
            <div className="text-base font-bold text-white mb-1">{d.name}</div>
            <div className="text-xs text-slate-400 line-clamp-2">{d.tagline}</div>
          </button>
        ))}
      </div>

      {/* Active Scenario Showcase Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white">
                {currentDemo.name}
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {currentDemo.amount}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {currentDemo.scenario}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleRunDemo(activeDemoId)}
              disabled={loading[activeDemoId]}
              className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wide hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cyber-glow-cyan disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading[activeDemoId] ? "Processing OCR & Ledger..." : "Execute Real Pipeline"}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout: Screenshot Preview + Real-time Backend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sample Screenshot */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Synthesized Test Screenshot</span>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 shadow-2xl flex items-center justify-center max-h-[500px]">
              <img
                src={currentDemo.image}
                alt={currentDemo.name}
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div>Target UTR: <span className="text-white">{currentDemo.utr}</span></div>
              <div>Simulated App: PhonePe / Paytm / GPay Mock</div>
            </div>
          </div>

          {/* Right Column: Execution Output or Waiting State */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Backend Pipeline Verdict</span>
            </div>

            {loading[activeDemoId] && (
              <div className="p-12 rounded-2xl glass-panel border border-cyan-500/40 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                <div className="font-mono text-cyan-300 font-bold text-sm tracking-wider uppercase">
                  Executing Computer Vision & RapidOCR...
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Parsing image with RapidOCR ONNX, checking Error Level Analysis (ELA), and auditing SQLite merchant ledger.
                </p>
              </div>
            )}

            {errors[activeDemoId] && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                {errors[activeDemoId]}
              </div>
            )}

            {!currentResult && !loading[activeDemoId] && (
              <div className="p-10 rounded-2xl glass-panel border border-slate-800 text-center space-y-3 text-slate-400">
                <Shield className="w-10 h-10 text-slate-700 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">
                  Pipeline Idle for {currentDemo.name}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click <strong>"Execute Real Pipeline"</strong> above to dispatch this sample through the actual OCR engine and database cross-checker.
                </p>
              </div>
            )}

            {currentResult && !loading[activeDemoId] && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Result Status Banner */}
                <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
                  <VerificationBadge status={currentResult.verification_status} size="lg" />
                  <a
                    href={getReportPdfUrl(currentResult.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Certificate</span>
                  </a>
                </div>

                {/* Risk Meter */}
                <RiskMeter score={currentResult.suspicion_score} level={currentResult.risk_level} />

                {/* Data Matrix */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="font-mono text-[11px] text-cyan-400 font-bold border-b border-slate-800 pb-1">
                      Screenshot Extracted
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Claimed Amount:</span>
                      <span className="font-mono text-base font-bold text-white">
                        {currentResult.extracted_amount ? `₹${currentResult.extracted_amount.toLocaleString('en-IN')}` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted UTR:</span>
                      <span className="font-mono text-xs text-cyan-300 select-all">
                        {currentResult.extracted_utr || "Unrecognized"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Status:</span>
                      <span className="font-mono text-xs text-slate-300">
                        {currentResult.extracted_status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="font-mono text-[11px] text-blue-400 font-bold border-b border-slate-800 pb-1">
                      Merchant Bank Ledger
                    </div>
                    {currentResult.matched_transaction ? (
                      <>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Actual Credit:</span>
                          <span className="font-mono text-base font-bold text-emerald-400">
                            ₹{currentResult.matched_transaction.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Confirmed UTR:</span>
                          <span className="font-mono text-xs text-slate-300 select-all">
                            {currentResult.matched_transaction.utr_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Payer Name:</span>
                          <span className="font-mono text-xs text-slate-300">
                            {currentResult.matched_transaction.payer_name}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center text-slate-500 font-mono text-[11px] space-y-1">
                        <div className="text-rose-400 font-bold">No Matching Credit</div>
                        <div className="text-[10px] text-slate-500">Zero entries found in merchant records for this UTR.</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detected Risk Factors */}
                {currentResult.risk_factors && currentResult.risk_factors.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2 text-xs">
                    <div className="font-mono text-rose-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Heuristic Anomaly Flags</span>
                    </div>
                    <ul className="space-y-1">
                      {currentResult.risk_factors.map((f, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-2">
                          <span className="text-rose-400 font-mono font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Judge Talking Points Box */}
            <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Judge Pitch Notes & Architecture Explanation</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentDemo.judgeTalkingPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono font-bold">✔</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
