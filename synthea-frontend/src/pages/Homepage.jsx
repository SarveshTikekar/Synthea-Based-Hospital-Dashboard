import { ArrowRight, Activity, Database, Zap, Layers, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from '@/components/FeatureCard';

const Homepage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-white text-slate-900 font-sans selection:bg-teal-500 selection:text-white flex flex-col">
      
      {/* --- HERO SECTION --- */}
      <div className="flex-grow flex flex-col justify-center pt-20 lg:pt-24 pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Status Badge */}
          <div className="mb-6 lg:mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-teal-800 bg-white border border-slate-200 shadow-sm uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              System Operational • v2.0
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 lg:mb-8 leading-tight">
            Hospital <span className="text-teal-600">Administration</span> Dashboard
          </h1>
          
          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto">
            Streamline hospital operations with real-time insights from synthetic patient data. 
            Powered by <strong className="text-slate-900">PySpark ETL</strong> for scalable analytics and a 
            <strong className="text-slate-900">React interface</strong> for effortless decision-making.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard" 
              className="group w-full sm:w-auto rounded-xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Access Dashboard 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            
            <a 
              href="https://github.com/SarveshTikekar/Synthea-Based-Hospital-Dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="group w-full sm:w-auto rounded-xl px-8 py-4 text-base font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Database size={20} className="text-slate-400 group-hover:text-teal-600 transition-colors"/> 
              Explore Repository
            </a>
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="w-full bg-white border-t border-slate-200 py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Essential Tools for Hospital Management</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm lg:text-base">
              Designed for administrators to monitor, analyze, and optimize hospital performance with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard 
              icon={Users} 
              title="Patient Demographics" 
              desc="Track population trends, admission rates, and staffing needs for better resource planning." 
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Operational Metrics" 
              desc="Monitor bed utilization, length of stay, and readmission rates to drive efficiency." 
            />
            <FeatureCard 
              icon={Layers} 
              title="Scalable ETL Processing" 
              desc="PySpark handles large datasets seamlessly, ensuring fast, reliable data transformations." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Insights" 
              desc="Flask API delivers quick access to aggregated metrics, reducing wait times for critical data." 
            />
            <FeatureCard 
              icon={Activity} 
              title="Condition Tracking" 
              desc="Analyze chronic diseases and treatment outcomes to improve patient care protocols." 
            />
            <FeatureCard 
              icon={Database} 
              title="Secure Data Handling" 
              desc="Uses synthetic FHIR data for privacy-compliant simulations of real hospital scenarios." 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
