import { ArrowRight, Activity, Database, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    // CHANGED: bg-slate-950 -> bg-gray-50, text-slate-200 -> text-gray-900
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans selection:bg-teal-500 selection:text-white pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
        
        {/* Status Badge */}
        <div className="mb-8 flex justify-center">
          {/* CHANGED: Backgrounds to white/gray, text to teal-700 */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-teal-700 bg-white border border-gray-200 shadow-sm uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            System Online • v2.0
          </div>
        </div>
        
        {/* Main Title */}
        {/* CHANGED: text-white -> text-gray-900 */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
          Synthea <span className="text-teal-600">Command Center</span>
        </h1>
        
        {/* Description */}
        {/* CHANGED: text-slate-400 -> text-gray-600 */}
        <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          A production-grade analytics platform transforming raw FHIR data into actionable clinical insights. 
          Migrated from legacy scripts to a <strong className="text-gray-900">Spark Backend</strong> and 
          <strong className="text-gray-900"> React Frontend</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link 
            to="/patients" 
            className="group w-full sm:w-auto rounded-lg bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Launch Dashboard 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
          
          <a 
            href="https://github.com/synthetichealth/synthea" 
            target="_blank" 
            rel="noreferrer" 
            // CHANGED: text-slate-400 -> text-gray-500, hover:bg-slate-900 -> hover:bg-gray-100
            className="group w-full sm:w-auto rounded-lg px-8 py-4 text-base font-medium text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            <Database size={20} className="text-gray-400 group-hover:text-teal-600 transition-colors"/> 
            View Data Source
          </a>
        </div>
      </div>

      {/* --- ARCHITECTURE CARDS --- */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <FeatureCard 
            icon={Activity} 
            title="Clinical Intelligence" 
            desc="Real-time monitoring of patient demographics, chronic conditions, and encounter history using aggregated FHIR data." 
          />
          
          <FeatureCard 
            icon={Layers} 
            title="Distributed Architecture" 
            desc="Decoupled ETL pipeline using PySpark for heavy lifting, ensuring the frontend remains responsive and lightweight." 
          />
          
          <FeatureCard 
            icon={Zap} 
            title="High Performance API" 
            desc="Flask-based REST endpoints serve pre-aggregated JSON payloads, reducing dashboard load times by 80%." 
          />

        </div>
      </div>

    </div>
  );
};

// Reusable Card Component (Light Mode)
const FeatureCard = ({ icon: Icon, title, desc }) => (
  // CHANGED: bg-slate-900 -> bg-white, border-white/5 -> border-gray-200
  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all duration-300 group h-full">
    {/* CHANGED: bg-slate-800 -> bg-teal-50 */}
    <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    {/* CHANGED: text-white -> text-gray-900 */}
    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{title}</h3>
    {/* CHANGED: text-slate-400 -> text-gray-600 */}
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default Homepage;
