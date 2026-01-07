import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { patientDashboard } from "@/api/api";
import { Users, Heart, DollarSign, TrendingUp, Users2, Activity, Globe, Scale } from "lucide-react";
import KPICard from "@/components/KPICard";
import MetricsCard from "@/components/MetricsCard";

const PatientDashboard = () => {
  const [data, setData] = useState({ kpis: {}, metrics: {}, trends: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await patientDashboard();
        // Matching the Flask structure: { kpis: {}, metrics: {}, metric_trends: {} }
        if (result) {
          setData({
            kpis: result.kpis || {},
            metrics: result.metrics || {},
            trends: result.metric_trends || {}
          });
        } else {
          setError("Failed to load patient data.");
        }
      } catch (err) {
        setError("Error fetching dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Map KPI Data (Injecting placeholder prevValues and periodTypes)
  const kpiData = [
    { 
      title: "Total Patients", 
      value: data.kpis.total_patients || 0, 
      prevValue: (data.kpis.total_patients || 0) - 5, 
      periodType: "month",
      icon: Users, 
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600" 
    },
    { 
      title: "Active Rate", 
      value: data.kpis.active_patient_rate || 0, 
      prevValue: 88, 
      periodType: "quarter",
      sentiment: "higher-is-better",
      icon: Heart, 
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600" 
    },
    { 
      title: "Gender Balance", 
      value: data.kpis.gender_balance_ratio || 0, 
      prevValue: 49, 
      periodType: "year",
      icon: Users2, 
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600" 
    },
    { 
      title: "Mean Income", 
      value: `$${(data.kpis.mean_family_income || 0).toLocaleString()}`, 
      prevValue: 52000, 
      periodType: "year",
      icon: DollarSign, 
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600" 
    },
    { 
      title: "Median Income", 
      value: `$${(data.kpis.median_family_income || 0).toLocaleString()}`, 
      prevValue: 48000, 
      periodType: "year",
      icon: TrendingUp, 
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600" 
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Activity size={48} className="animate-spin text-teal-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Analyzing Patient Data...</h2>
          <p className="text-slate-400">Spark is processing ETL trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-8 sticky top-0 z-20">
          <div className="max-w-full">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Real-time demographic and economic insights</p>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {/* Section 1: KPI Grid */}
          <KPICard kpis={kpiData} />

          {/* Section 2: Trend Analysis (Using MetricsCard for each Spark Trend) */}
          <div className="space-y-10">
            <MetricsCard 
              title="Economic Dependence" 
              metrics={[
                { label: "Current Ratio", value: `${data.metrics.economic_dependence_ratio}%` },
              ]} 
              chartData={data.trends.economic_dependence} 
              chartType="bar"
            />

            <MetricsCard 
              title="Cultural Diversity" 
              metrics={[
                { label: "Diversity Score", value: `${data.metrics.cultural_diversity_score}%` }
              ]} 
              chartData={data.trends.cultural_diversity} 
              chartType="line"
            />

            <MetricsCard 
              title="Mortality Analysis" 
              metrics={[
                { label: "Current Rate", value: `${data.metrics.mortality_rate?.toFixed(2)}%` }
              ]} 
              chartData={data.trends.mortality_rate} 
              chartType="line"
            />
          </div>

          <div className="pb-20"></div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
