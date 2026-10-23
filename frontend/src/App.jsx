import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import VerifyPage from './pages/VerifyPage';
import DemoModePage from './pages/DemoModePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [inspectedRecord, setInspectedRecord] = useState(null);

  const handleInspectRecord = (rec) => {
    setInspectedRecord(rec);
    setActiveTab("verify");
  };

  return (
    <div className="min-h-screen bg-[#050813] text-slate-100 cyber-grid-bg flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "landing" && (
          <LandingPage setActiveTab={setActiveTab} />
        )}

        {activeTab === "verify" && (
          <VerifyPage 
            initialRecord={inspectedRecord} 
            key={inspectedRecord?.id || "fresh-verify"} 
          />
        )}

        {activeTab === "demo" && (
          <DemoModePage 
            setActiveTab={setActiveTab} 
            setInspectedRecord={handleInspectRecord} 
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardPage 
            setActiveTab={setActiveTab} 
            setInspectedRecord={handleInspectRecord} 
          />
        )}

        {activeTab === "history" && (
          <HistoryPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
