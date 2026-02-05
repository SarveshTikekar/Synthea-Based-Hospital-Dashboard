import React, { useState, useEffect } from "react";
import DataGenerationButton from "@/components/DataGenerationButton";
import { generatePatients } from "@/api/api";
import { Activity, Database, Users, FileText, AlertCircle, Server, Terminal, Play } from "lucide-react";

const DataGeneration = () => {
  const [message, setMessage] = useState("");
  const [logHistory, setLogHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    patientCount: 0,
    proceduresCount: 0,
    encountersCount: 0,
  });



  const addLog = (msg) => {
    // Split multiline messages (like stdout) into separate log entries
    const lines = msg.split('\n').filter(line => line.trim() !== '');
    const newLogs = lines.map(line => `[${new Date().toLocaleTimeString()}] ${line}`);

    setLogHistory(prev => [...newLogs, ...prev].slice(0, 200));  // Keep more history
    setMessage(msg);
  };

  const handleGeneration = async (count) => {
    setIsLoading(true);
    addLog(`Initializing generation sequence for ${count} records...`);

    try {
      const result = await generatePatients({ numberOfPatients: count });

      if (result?.status === "success") {
        addLog(result.message);

        // Log stdout from the script
        if (result.stdout) {
          addLog("--- SCRIPT OUTPUT START ---");
          addLog(result.stdout);
          addLog("--- SCRIPT OUTPUT END ---");
        }

        // Update Metrics
        if (result.datagen_metrics && result.datagen_metrics.length > 0) {
          const metrics = result.datagen_metrics[0];
          setStats({
            patientCount: metrics.patient_count || stats.patientCount,
            proceduresCount: metrics.procedures_count || stats.proceduresCount,
            encountersCount: metrics.encounters_count || stats.encountersCount
          });
          addLog(`Metrics Updated: ${metrics.patient_count} Patients, ${metrics.procedures_count} Procedures, ${metrics.encounters_count} Encounters`);
        }

      } else {
        addLog(result?.message || "Generation complete with unknown status.");
      }
    } catch (error) {
      addLog("ERROR: Generation failed. Check server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-8 -mx-8 -mt-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-2xl">
            <Database size={24} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Generation</h1>
            <p className="text-slate-500 mt-1 font-medium">Synthea™ Engine Control Panel</p>
          </div>
        </div>
      </header>

      <div className="space-y-8 max-w-7xl mx-auto w-full">

        {/* Top Section: Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Patients"
            value={stats.patientCount !== undefined ? stats.patientCount.toLocaleString() : "..."}
            icon={Users}
            color="blue"
          />
          <StatsCard
            label="Procedures Logged"
            value={stats.proceduresCount !== undefined ? stats.proceduresCount.toLocaleString() : "..."}
            icon={Activity}
            color="indigo"
          />
          <StatsCard
            label="Active Encounters"
            value={stats.encountersCount !== undefined ? stats.encountersCount.toLocaleString() : "..."}
            icon={FileText}
            color="emerald"
          />
          <StatsCard
            label="System Status"
            value="ONLINE"
            icon={Server}
            color="teal"
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
          {/* ... rest of the component ... */}

          {/* Left Column: Controls (2/3 width on large screens) */}
          <section className="xl:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Play size={20} className="text-teal-600 fill-teal-600" />
                <h2 className="text-xl font-bold text-slate-800">Generation Controls</h2>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 mb-8">
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Select a preset batch size to trigger the Synthea engine.
                  This process runs in the background and simulates realistic patient lifecycles.
                </p>
                <div className="flex flex-wrap gap-4">
                  {[50, 100, 200, 500].map(n => (
                    <DataGenerationButton
                      key={n}
                      numberOfPatients={n}
                      onGenerate={handleGeneration}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-amber-50 text-amber-600 px-4 py-3 rounded-xl border border-amber-100">
                <AlertCircle size={16} />
                <span>Heavy workloads (&gt;500) may take several minutes to process.</span>
              </div>
            </div>
          </section>

          {/* Right Column: Terminal Logs */}
          <section className="xl:col-span-1 h-full">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-800 h-full flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-teal-500" />
                  <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">System Output</h3>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-teal-500/10 rounded-full">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-teal-500 uppercase">Processing</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar">
                {logHistory.length === 0 ? (
                  <div className="text-slate-600 italic">Waiting for command...</div>
                ) : (
                  logHistory.map((log, i) => (
                    <div key={i} className={`break-words ${i === 0 ? 'text-teal-400 font-bold' : 'text-slate-400'}`}>
                      <span className="opacity-50 mr-2">&gt;</span>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

const StatsCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-teal-100 hover:shadow-md transition-all">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

export default DataGeneration;
