import React, { useState, useEffect, useRef } from 'react';
import DataGenerationButton from '../components/DataGenerationButton';
import { API_URL } from '../api/api';
import { Terminal, Database, Play, AlertCircle, CheckCircle, Loader, Cpu, MapPin, Users } from 'lucide-react';

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const DataGeneration = () => {
  const [status, setStatus] = useState('idle'); // idle, generating, complete, error
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [numPatients, setNumPatients] = useState(150);
  const [stateName, setStateName] = useState('');
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { msg, type, timestamp }]);
  };

  const handleGenerate = async () => {
    setStatus('generating');
    setProgress(0);
    setLogs([]);
    addLog(`Initializing Synthea Generation Sequence for ${numPatients} patients in ${stateName || 'Massachusetts'}...`, 'system');
    // Start progress simulation (optional)
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 5);
      if (prog > 95) prog = 95;
      setProgress(prog);
    }, 400);

    // Setup Server-Sent Events listener
    const sseUrl = `${API_URL}/generate_data?num_patients=${numPatients}&state=${stateName}`;
    const eventSource = new EventSource(sseUrl);
    eventSource.onmessage = (e) => {
      const msg = e.data;
      // Determine log type based on content
      let type = 'info';
      if (msg.includes('[SYSTEM]')) type = 'system';
      else if (msg.includes('[SUCCESS]')) type = 'success';
      else if (msg.includes('[ERROR]')) type = 'error';
      addLog(msg, type);
      if (type === 'success') {
        clearInterval(interval);
        setProgress(100);
        setStatus('complete');
        eventSource.close();
      }
      if (type === 'error') {
        clearInterval(interval);
        setStatus('error');
        eventSource.close();
      }
    };
    eventSource.onerror = (e) => {
      clearInterval(interval);
      addLog('Error while receiving logs.', 'error');
      setStatus('error');
      eventSource.close();
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Database className="text-teal-600" /> Data Operations Center
        </h1>
        <p className="text-slate-500 font-medium mt-2">Manage synthetic data lifecycle and ETL processes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 h-[500px]">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Cpu size={16} /> System Controls
            </h2>

            <div className="space-y-6">
              {/* Configuration Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Users size={14} /> Number of Patients
                  </label>
                  <input
                    type="number"
                    value={numPatients}
                    onChange={(e) => setNumPatients(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 150"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Target State (Optional)
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1 italic">Defaults to Massachusetts if not selected.</p>
                </div>
              </div>

              <DataGenerationButton
                numberOfPatients={numPatients}
                onGenerate={handleGenerate}
                isLoading={status === 'generating'}
              />

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700 mb-2">Notice:</p>
                Generating large datasets (1000+ patients) may take several minutes. Ensure the backend server has sufficient memory allocated.
              </div>
            </div>


          </div>

        </div>

        {/* Terminal / Log Output */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col h-[500px] border border-slate-800">
            {/* Terminal Header */}
            <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-300">synthea-cli — watch</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-5 font-mono text-xs md:text-sm overflow-y-auto bg-[#0d1117] custom-scrollbar-dark space-y-2.5">
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500 select-none">
                  <p className="font-mono text-xs">Waiting for generation command...</p>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 items-start animate-fade-in-left leading-relaxed">
                  <span className="text-slate-500 font-mono shrink-0 select-none">[{log.timestamp}]</span>
                  <span className="shrink-0 font-mono font-bold select-none min-w-[75px]">
                    {log.type === 'system' && <span className="text-[#58a6ff]">[SYSTEM]</span>}
                    {log.type === 'success' && <span className="text-[#2ea44f]">[SUCCESS]</span>}
                    {log.type === 'error' && <span className="text-[#cf222e]">[ERROR]</span>}
                    {log.type === 'info' && <span className="text-[#8b949e]">[INFO]</span>}
                  </span>
                  <span className={`font-mono break-all
                    ${log.type === 'error' ? 'text-rose-100' : ''}
                    ${log.type === 'success' ? 'text-emerald-100' : ''}
                    ${log.type === 'system' ? 'text-blue-100' : ''}
                    ${log.type === 'info' ? 'text-zinc-100' : ''}
                  `}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataGeneration;
