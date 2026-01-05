import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { patientDashboard } from "@/api/api";
import { Users, Heart, DollarSign, TrendingUp, Users2, Activity } from "lucide-react";
import KPICard from "@/components/KPICard";
import MetricsCard from "@/components/MetricsCard";
import AdvancedMetricsCard from "@/components/AdvancedMetricsCard";

const PatientDashboard = () => {
  const [kpis, setKpis] = useState({});
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await patientDashboard();
        if (result.patient_dashboard) {
          setKpis(result.patient_dashboard.kpis || {});
          setMetrics(result.patient_dashboard.metrics || {});
        } else {
          setError(result.message || "Failed to load patient data.");
        }
      } catch (err) {
        setError("Error fetching dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Generalized KPI data
  const kpiData = [
    { key: "total_patients", title: "Total Patients", value: kpis.total_patients || 0, icon: Users, iconColor: "text-blue-600" },
    { key: "active_patient_rate", title: "Active Patient Rate", value: kpis.active_patient_rate || 0, displayValue: `${kpis.active_patient_rate || 0}%`, icon: Heart, iconColor: "text-green-600" },
    { key: "gender_balance_ratio", title: "Gender Balance Ratio", value: kpis.gender_balance_ratio || 0, displayValue: `${kpis.gender_balance_ratio || 0}%`, icon: Users2, iconColor: "text-purple-600" },
    { key: "mean_family_income", title: "Mean Family Income", value: kpis.mean_family_income || 0, displayValue: `$${kpis.mean_family_income || 0}`, icon: DollarSign, iconColor: "text-yellow-600" },
    { key: "median_family_income", title: "Median Family Income", value: kpis.median_family_income || 0, displayValue: `$${kpis.median_family_income || 0}`, icon: TrendingUp, iconColor: "text-orange-600" },
  ];

  // Generalized metrics data
  const metricsList = [
    { label: "Economic Dependence Ratio", value: `${metrics.economic_dependence_ratio || 0}%` },
    { label: "Cultural Diversity Score", value: `${metrics.cultural_diversity_score || 0}%` },
    { label: "Mortality Rate", value: `${(metrics.mortality_rate || 0).toFixed(2)}%` },
    { label: "Age-Wealth Correlation", value: (metrics.age_wealth_correlation || 0).toFixed(2) },
    { label: "Income Inequality Index", value: (metrics.income_inequality_index || 0).toFixed(2) },
  ];

  const chartData = [
    { name: "Economic Dep", value: metrics.economic_dependence_ratio || 0 },
    { name: "Cultural Div", value: metrics.cultural_diversity_score || 0 },
    { name: "Mortality", value: parseFloat((metrics.mortality_rate || 0).toFixed(2)) },
    { name: "Age-Wealth Corr", value: parseFloat((metrics.age_wealth_correlation || 0).toFixed(2)) },
    { name: "Income Ineq", value: parseFloat((metrics.income_inequality_index || 0).toFixed(2)) },
  ];

  // Generalized scatter data
  const scatterData = {
    datasets: [
      {
        label: "Age vs Income",
        data: Array.from({ length: 50 }, () => ({
          x: 20 + Math.random() * 60,
          y: 20000 + Math.random() * 80000,
        })),
        backgroundColor: "rgba(20, 184, 166, 0.6)",
        borderColor: "rgba(20, 184, 166, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Activity size={40} className="animate-spin text-teal-600" />
          <span className="ml-2 text-lg">Loading Patient Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
   <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">

    <Navbar />

    {/* 3. CONTENT AREA: 'flex-1' (takes remaining width) + 'overflow-y-auto' (scrolls internally) */}
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
      
      <header className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm shrink-0">
        <div className="max-w-full">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Insights from patient data ETL processing</p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        <div className="w-full space-y-6 lg:space-y-8">
          <KPICard kpis={kpiData} />
          <MetricsCard title="Patient Metrics" metrics={metricsList} chartData={chartData} />
          <AdvancedMetricsCard title="Age-Wealth Correlation" correlationValue={metrics.age_wealth_correlation} scatterData={scatterData} />
          {/* Spacer at the bottom so you can scroll past the last card */}
          <div className="pb-10"></div>
        </div>
      </main>

    </div>
  </div>
  );
};

export default PatientDashboard;