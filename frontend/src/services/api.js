const API_BASE = ""; // Uses Vite proxy in development

export async function analyzeScreenshot(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function verifyTransaction(utrNumber, claimedAmount) {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      utr_number: utrNumber,
      claimed_amount: claimedAmount ? parseFloat(claimedAmount) : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Verification failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function getDashboardMetrics() {
  const res = await fetch(`${API_BASE}/api/dashboard`);
  if (!res.ok) throw new Error("Failed to load dashboard metrics");
  return res.json();
}

export async function getHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.risk_level && params.risk_level !== "ALL") query.append("risk_level", params.risk_level);
  if (params.limit) query.append("limit", params.limit);
  if (params.offset) query.append("offset", params.offset);

  const res = await fetch(`${API_BASE}/api/history?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function getHistoryDetail(recordId) {
  const res = await fetch(`${API_BASE}/api/history/${recordId}`);
  if (!res.ok) throw new Error("Failed to fetch record details");
  return res.json();
}

export async function getDemoCases() {
  const res = await fetch(`${API_BASE}/api/demo/cases`);
  if (!res.ok) throw new Error("Failed to fetch demo cases");
  return res.json();
}

export async function runDemoPipeline(caseId) {
  const res = await fetch(`${API_BASE}/api/demo/run/${caseId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Demo execution failed" }));
    throw new Error(err.detail || "Demo failed");
  }
  return res.json();
}

export function getReportPdfUrl(recordId) {
  return `${API_BASE}/api/report/${recordId}/pdf`;
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("System health check failed");
  return res.json();
}
