import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, RefreshCw, Download, 
  Eye, X, Shield, AlertTriangle, Layers, Calendar 
} from 'lucide-react';
import { getHistory, getHistoryDetail, getReportPdfUrl } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import RiskMeter from '../components/RiskMeter';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getHistory({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        risk_level: riskFilter !== "ALL" ? riskFilter : undefined,
        limit: 100,
      });
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleViewDetail = async (recordId) => {
    setModalLoading(true);
    try {
      const detail = await getHistoryDetail(recordId);
      setSelectedRecord(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transaction Verification Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Persisted SQLite audit trail of all screenshot verifications and merchant settlement cross-checks.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="self-start sm:self-auto px-4 py-2 rounded-xl glass-panel text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by UTR number, payee, or OCR text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">VERIFIED Only</option>
              <option value="MISMATCH">MISMATCH Only</option>
              <option value="NOT FOUND">NOT FOUND Only</option>
              <option value="INCONCLUSIVE">INCONCLUSIVE Only</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors flex items-center justify-center"
            >
              Filter
            </button>
          </div>
        </form>

        <div className="text-xs font-mono text-slate-400 pt-1 flex items-center justify-between">
          <span>Showing {records.length} of {total} total audited scans</span>
          {search && (
            <button
              onClick={() => { setSearch(""); fetchRecords(); }}
              className="text-cyan-400 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3.5 px-4">DATE & TIME</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">EXTRACTED UTR</th>
                <th className="py-3.5 px-4">AMOUNT</th>
                <th className="py-3.5 px-4">RISK INDEX</th>
                <th className="py-3.5 px-4">DETAILS</th>
                <th className="py-3.5 px-4 text-right">CERTIFICATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
                    Querying persisted audit ledger...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {rec.created_at ? new Date(rec.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <VerificationBadge status={rec.verification_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 select-all font-semibold">
                      {rec.extracted_utr || "Unrecognized"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {rec.extracted_amount !== null ? `₹${rec.extracted_amount.toLocaleString('en-IN')}` : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        rec.suspicion_score <= 29 ? "text-emerald-400 bg-emerald-950/60" :
                        rec.suspicion_score <= 69 ? "text-amber-400 bg-amber-950/60" :
                        "text-rose-400 bg-rose-950/60"
                      }`}>
                        {rec.suspicion_score}/100 ({rec.risk_level})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleViewDetail(rec.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={getReportPdfUrl(rec.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-colors text-[11px]"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-mono">
                    No matching transaction verification records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 cyber-glow-blue shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <VerificationBadge status={selectedRecord.verification_status} size="md" />
                <span className="text-xs font-mono text-slate-400">
                  ID: {selectedRecord.analysis_id.slice(0, 8)}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <RiskMeter score={selectedRecord.suspicion_score} level={selectedRecord.risk_level} />

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-mono text-cyan-400 font-bold uppercase">Operational Guidance</div>
              <p className="text-slate-300">{selectedRecord.suggested_action}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Extracted UTR:</div>
                <div className="font-bold text-white select-all">{selectedRecord.extracted_utr || "None"}</div>
                <div className="text-slate-400 text-[10px] pt-1">Claimed Amount:</div>
                <div className="font-bold text-cyan-300">
                  {selectedRecord.extracted_amount ? `₹${selectedRecord.extracted_amount}` : "N/A"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Ledger Status:</div>
                <div className="font-bold text-emerald-400">
                  {selectedRecord.matched_transaction ? selectedRecord.matched_transaction.status : "No Match Found"}
                </div>
                <div className="text-slate-400 text-[10px] pt-1">Bank Settlement Credit:</div>
                <div className="font-bold text-white">
                  {selectedRecord.matched_transaction ? `₹${selectedRecord.matched_transaction.amount}` : "₹0.00"}
                </div>
              </div>
            </div>

            {selectedRecord.risk_factors && selectedRecord.risk_factors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 text-xs space-y-2">
                <div className="text-rose-400 font-mono font-bold">Detected Flags:</div>
                <ul className="space-y-1">
                  {selectedRecord.risk_factors.map((f, i) => (
                    <li key={i} className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <a
                href={getReportPdfUrl(selectedRecord.id)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Audit Sheet</span>
              </a>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl glass-panel text-slate-300 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
