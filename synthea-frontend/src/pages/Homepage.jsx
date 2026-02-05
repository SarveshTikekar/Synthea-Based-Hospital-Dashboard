import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Users, LayoutDashboard, TrendingUp, Layers, Zap, Database } from "lucide-react";
import FeatureCard from "../components/FeatureCard";

const Homepage = () => {
  return (
    <div className="font-sans text-slate-900">
      {/* Hero Section */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-12 lg:p-20 text-center mb-12 shadow-sm">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Welcome to <span className="text-teal-600">SyntheaDash</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          A modern, ERP-style hospital management system powered by synthetic patient data.
          Visualize trends, track conditions, and manage hospital operations in real-time.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/dashboard"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-200 transition-all flex items-center gap-2 hover:-translate-y-1"
          >
            <LayoutDashboard size={20} />
            Launch Dashboard
          </Link>
          <a
            href="https://github.com/SarveshTikekar/Synthea-Based-Hospital-Dashboard"
            target="_blank"
            rel="noreferrer"
            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center gap-2 hover:border-teal-200 hover:text-teal-600"
          >
            <Database size={20} />
            View Repository
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default Homepage;
