import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"; 
import DataGenerationButton from "@/components/DataGenerationButton";
import { generatePatients, getPatientCount } from "@/api/api";
import { Activity } from "lucide-react";

const DataGeneration = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const fetchPatientCount = async () => {
      const result = await getPatientCount();
      if (result?.patientCount !== undefined) setPatientCount(result.patientCount);
    };
    fetchPatientCount();
  }, []);

  const handleGeneration = async (count) => {
    setIsLoading(true);
    setMessage(`Requesting ${count} patient records...`);
    const result = await generatePatients({ numberOfPatients: count });
    if (result?.patientCount) setPatientCount(prev => prev + result.patientCount);
    setMessage(result?.message || "Generation complete.");
    setIsLoading(false);
  };

  return (
    // PARENT: Flex Row to put Navbar and Content side-by-side
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      
      {/* CHILD 1: The Navbar (Fixed width determined by Navbar.jsx) */}
      <Navbar />

      {/* CHILD 2: The Main Content (Takes ALL remaining space) */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-gray-50">
        
        {/* Header - Stretches full width of CHILD 2 */}
        <header className="bg-white border-b border-gray-200 py-6 px-10 shadow-sm w-full">
          <h1 className="text-3xl font-extrabold text-teal-600 tracking-tight">
            Hospital Data Generation
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest">
            Synthea™ Integration Panel
          </p>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-10 w-full">
          <div className="flex flex-col gap-10 w-full">
            
            {/* Grid for Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full">
              
              {/* Controls */}
              <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-teal-600 mb-8 border-b pb-4">
                  Data Generation Controls
                </h2>
                <div className="flex flex-wrap gap-4">
                  {[50, 100, 200, 250, 300].map(n => (
                    <DataGenerationButton 
                        key={n} 
                        numberOfPatients={n} 
                        onGenerate={handleGeneration} 
                        isLoading={isLoading} 
                    />
                  ))}
                </div>
              </section>

              {/* Metrics */}
              <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-teal-600 mb-8 border-b pb-4">
                  Live Database Metrics
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <MetricCard label="Total Patients" value={patientCount.toLocaleString()} />
                  <MetricCard label="Procedures" value="38,240" />
                  <MetricCard label="Allergies" value="1,542" />
                  <MetricCard label="Conditions" value="1,010" />
                </div>
              </section>
            </div>

            {/* System Output Log */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full">
              <h3 className="text-teal-600 font-bold mb-4 uppercase text-xs tracking-widest">System Logs</h3>
              <div className="bg-gray-900 text-teal-400 p-8 rounded-xl border border-gray-800 min-h-[140px] flex items-center justify-center font-mono text-xl shadow-inner">
                {isLoading && <Activity size={28} className="animate-spin mr-6" />}
                <span className="animate-pulse">{message || "Ready for input..."}</span>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-component
const MetricCard = ({ label, value }) => (
  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-start justify-center shadow-inner h-28">
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-extrabold text-gray-800">{value}</p>
  </div>
);

export default DataGeneration;
