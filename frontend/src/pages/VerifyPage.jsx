import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileImage, X, Shield, AlertTriangle, 
  CheckCircle, Download, RefreshCw, Eye, Info, Search, 
  Layers, Lock, Sparkles, AlertOctagon, Terminal
} from 'lucide-react';
import { analyzeScreenshot, verifyTransaction, getReportPdfUrl } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import RiskMeter from '../components/RiskMeter';

export default function VerifyPage({ initialRecord = null }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(initialRecord);
  const [error, setError] = useState(null);
  const [showRawOcr, setShowRawOcr] = useState(false);

  // Manual query tool state
  const [manualUtr, setManualUtr] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image file size exceeds maximum limit of 10MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeScreenshot(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze screenshot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async (e) => {
    e.preventDefault();
    if (!manualUtr.trim()) return;
    setManualLoading(true);
    try {
      const res = await verifyTransaction(manualUtr, manualAmount);
      setManualResult(res);
    } catch (err) {
      setManualResult({ error: err.message });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>REAL-TIME TRANSACTION VERIFICATION CORE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify UPI Payment Screenshot
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Upload any mobile payment screenshot to extract entity data via RapidOCR, inspect compression anomalies with OpenCV, and cross-reference the merchant bank ledger.
        </p>
      </div>

      {/* Main Upload & Dropzone Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative overflow-hidden ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/30 cyber-glow-cyan"
                : previewUrl
                ? "border-cyan-500/40 bg-slate-900/60"
                : "border-slate-800 hover:border-cyan-500/30 bg-slate-950/40"
            }`}
          >
            {/* Scanline radar animation overlay during loading */}
            {loading && (
              <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-scanline" />
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
                <div className="font-mono text-cyan-300 font-bold text-sm tracking-widest uppercase animate-pulse">
                  Analyzing Screenshot Forensics...
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  RapidOCR + OpenCV ELA + Ledger Check
                </div>
              </div>
            )}

            {!previewUrl ? (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Drag and drop your screenshot here
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, or WebP up to 10MB
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2"
                  >
                    <FileImage className="w-4 h-4" />
                    <span>Browse Files</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden max-h-[380px] bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img
                    src={previewUrl}
                    alt="Uploaded screenshot"
                    className="max-h-[380px] w-auto object-contain"
                  />
                  {!loading && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-white hover:bg-rose-900/80 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span className="truncate max-w-[200px]">{file?.name}</span>
                  <span>{file ? `${(file.size / 1024).toFixed(1)} KB` : ""}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleUploadAndAnalyze}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cyber-glow-cyan disabled:opacity-50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{loading ? "Processing..." : "Run AI Verification"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={clearSelection}
                    className="py-3 px-4 rounded-xl glass-panel text-slate-300 text-sm hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">Analysis Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Manual Ledger UTR Query Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <Search className="w-3.5 h-3.5" />
              <span>Direct Bank Ledger Query (Shopkeeper Lookup)</span>
            </div>
            <p className="text-xs text-slate-400">
              Have a UTR from customer or receipt? Check if it has settled into the simulated merchant ledger.
            </p>
            <form onSubmit={handleManualCheck} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="12-digit UTR (e.g. 329847192834)"
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Expected Amount (Optional)"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={manualLoading || !manualUtr}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{manualLoading ? "Querying..." : "Search Merchant Ledger"}</span>
              </button>
            </form>

            {manualResult && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400">Query Status:</span>
                  <VerificationBadge status={manualResult.verification_status} size="sm" />
                </div>
                <div className="text-slate-200">{manualResult.message}</div>
                {manualResult.matched_transaction && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>Payer: {manualResult.matched_transaction.payer_name} ({manualResult.matched_transaction.payer_upi})</div>
                    <div>Credit: ₹{manualResult.matched_transaction.amount.toFixed(2)} • {manualResult.matched_transaction.status}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Analysis Results Display */}
        <div className="lg:col-span-6 space-y-6">
          {!result ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-500">
              <Shield className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-base font-semibold text-slate-300">
                Awaiting Screenshot Submission
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Upload a screenshot or click on Demo Mode to inspect optical text recognition, compression forensics, and bank record matching.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Status Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <VerificationBadge status={result.verification_status} size="lg" />
                  <a
                    href={getReportPdfUrl(result.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Audit</span>
                  </a>
                </div>

                {/* Suggested Action Alert Box */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  result.verification_status === "VERIFIED"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : result.verification_status === "MISMATCH"
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                    : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                }`}>
                  <div className="font-bold uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Recommended Shopkeeper Action</span>
                  </div>
                  <p>{result.suggested_action}</p>
                </div>
              </div>

              {/* Risk Gauge */}
              <RiskMeter score={result.suspicion_score} level={result.risk_level} />

              {/* Extracted vs Merchant Ledger Comparison */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Transaction Cross-Verification Matrix</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Extracted Side */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="font-mono text-[11px] text-cyan-300 font-semibold border-b border-slate-800 pb-1">
                      OCR Extracted (Screenshot)
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Claimed Amount:</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {result.extracted_amount !== null ? `₹${result.extracted_amount.toLocaleString('en-IN')}` : "Unrecognized"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Detected UTR / Ref:</span>
                      <span className="font-mono text-xs text-cyan-300 select-all">
                        {result.extracted_utr || "Not Found"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Status:</span>
                      <span className="font-mono text-xs text-slate-300">
                        {result.extracted_status || "UNKNOWN"}
                      </span>
                    </div>
                    {result.extracted_timestamp && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Timestamp:</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {result.extracted_timestamp}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Merchant Database Side */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="font-mono text-[11px] text-blue-300 font-semibold border-b border-slate-800 pb-1">
                      Merchant Bank Ledger (DB)
                    </div>
                    {result.matched_transaction ? (
                      <>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bank Credit:</span>
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            ₹{result.matched_transaction.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Confirmed UTR:</span>
                          <span className="font-mono text-xs text-slate-300 select-all">
                            {result.matched_transaction.utr_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ledger Status:</span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">
                            {result.matched_transaction.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Payer / Ref:</span>
                          <span className="font-mono text-[11px] text-slate-300 truncate block">
                            {result.matched_transaction.payer_name} ({result.matched_transaction.order_ref})
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center text-slate-500 font-mono text-[11px] space-y-1">
                        <div>No credit record found.</div>
                        <div className="text-[10px] text-slate-600">Simulated merchant account has not received funds for this UTR.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detected Risk Factors */}
              {result.risk_factors && result.risk_factors.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-3">
                  <h3 className="text-xs font-mono uppercase text-rose-400 tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Detected Heuristic Anomaly Flags ({result.risk_factors.length})</span>
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {result.risk_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-300 p-2 rounded bg-slate-950/60 border border-slate-800">
                        <span className="font-mono text-rose-400 font-bold mt-0.5">[!]</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Computer Vision Forensics Breakdown */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Computer Vision & Compression Forensics</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">ELA Max Delta</div>
                    <div className="font-mono font-bold text-white mt-1">
                      {result.cv_metrics?.ela?.ela_max_delta ?? "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">Splicing Flag</div>
                    <div className={`font-mono font-bold mt-1 ${result.cv_metrics?.ela?.ela_anomaly_detected ? "text-rose-400" : "text-emerald-400"}`}>
                      {result.cv_metrics?.ela?.ela_anomaly_detected ? "FLAGGED" : "CLEAN"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">Sharpness</div>
                    <div className="font-mono font-bold text-white mt-1">
                      {result.cv_metrics?.quality?.sharpness_score ?? "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono">Duplicate Image</div>
                    <div className={`font-mono font-bold mt-1 ${result.cv_metrics?.is_duplicate ? "text-amber-400" : "text-slate-300"}`}>
                      {result.cv_metrics?.is_duplicate ? "YES (Re-used)" : "ORIGINAL"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw OCR Text Toggle */}
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => setShowRawOcr(!showRawOcr)}
                  className="font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showRawOcr ? "Hide Raw OCR Stream" : "Inspect Raw OCR Stream"}</span>
                </button>
                {showRawOcr && (
                  <pre className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200/80 overflow-x-auto whitespace-pre-wrap max-h-48">
                    {result.ocr_raw_text || "No text parsed"}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
