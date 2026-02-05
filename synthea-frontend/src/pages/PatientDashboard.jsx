import React, { useState, useEffect, useMemo } from "react";
import { patientDashboard } from "@/api/api";
import { Users, Heart, DollarSign, TrendingUp, Users2, Activity, Globe, Scale } from "lucide-react";
import KPICard from "@/components/KPICard";
import MetricsCard from "@/components/MetricsCard";
import AdvancedChartCard from "@/components/AdvancedChartCard";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// --- Data Transformation Helpers for Advanced Metrics --- // 

// 1. Transform Survival Trend: [{"males": [...]}, {"females": [...]}] -> [{age: 5, male: 0.99, female: 0.99}, ...]
const transformSurvivalData = (raw) => {
  if (!raw || raw.length < 2) return [];
  const males = raw[0].males; // List of {age: val}
  const females = raw[1].females;

  // Merge into single array
  return males.map((mItem, idx) => {
    const age = Object.keys(mItem)[0];
    const mVal = mItem[age];
    const fVal = females[idx] ? females[idx][age] : 0;
    return {
      name: `${age}y`,
      Male: mVal * 100, // percentage for better viz
      Female: fVal * 100
    };
  });
};

// 2. Transform Demographic Entropy: [("City", Val, [...]), ...] -> [{name: "City", value: Val}]
const transformEntropyData = (raw) => {
  if (!raw) return [];
  return raw.slice(0, 10).map(item => ({ // Take top 10 cities
    name: item[0],
    value: item[1]
  }));
};

// 3. Transform Wealth Trajectory: [("0-5", Inc, Vel), ...] -> [{name: "0-5", Income: Inc, Velocity: Vel}]
const transformWealthData = (raw) => {
  if (!raw) return [];
  return raw.map(item => ({
    name: item[0],
    Income: item[1],
    Velocity: item[2]
  }));
};

// 4. Transform Mortality Hazard: { "White": [("Q0", [min, max], prob), ...], ... } -> [{name: "Q0", White: prob, Black: prob...}]
const transformMortalityData = (raw) => {
  if (!raw) return [];
  const races = Object.keys(raw);
  const quintiles = ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9"];

  return quintiles.map(q => {
    const entry = { name: q };
    races.forEach(race => {
      const raceData = raw[race];
      if (Array.isArray(raceData)) {
        const qData = raceData.find(item => item[0] === q);
        entry[race] = qData ? qData[2] * 100 : 0; // percentage
      } else {
        entry[race] = 0;
      }
    });
    return entry;
  });
};

const PatientDashboard = () => {
  const [data, setData] = useState({ kpis: {}, metrics: {}, trends: {}, advanced: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await patientDashboard();
        // Matching the Flask structure: { kpis: {}, metrics: {}, metric_trends: {}, advanced_metrics: {} }
        if (result) {
          setData({
            kpis: result.kpis || {},
            metrics: result.metrics || {},
            trends: result.metric_trends || {},
            advanced: result.advanced_metrics || {}
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

  // Memoize transformed data for charts
  const survivalData = useMemo(() => transformSurvivalData(data.advanced.actural_survival_trend), [data.advanced.actural_survival_trend]);
  const entropyData = useMemo(() => transformEntropyData(data.advanced.demographic_entropy), [data.advanced.demographic_entropy]);
  const wealthData = useMemo(() => transformWealthData(data.advanced.wealth_trajectory), [data.advanced.wealth_trajectory]);
  const mortalityData = useMemo(() => transformMortalityData(data.advanced.mortality_hazard_by_quintiles), [data.advanced.mortality_hazard_by_quintiles]);

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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Activity size={48} className="animate-spin text-teal-600 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">Analyzing Patient Data...</h2>
          <p className="text-slate-400">Spark is processing ETL trends</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time demographic and economic insights</p>
      </header>

      <div className="space-y-10">
        {/* Section 1: KPI Grid */}
        <KPICard kpis={kpiData} />

        {/* Section 2: Trend Analysis (Standard Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Section 3: Advanced Analysis */}
        <div className="pt-10 border-t border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
            <Globe className="text-teal-600" /> Advanced Analysis
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* 1. Survival Trend */}
            <AdvancedChartCard
              title="Actual Survival Trend"
              subtitle="Male vs Female Survival Probability"
              icon={Activity}
            >
              <AreaChart data={survivalData}>
                <defs>
                  <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Male" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMale)" />
                <Area type="monotone" dataKey="Female" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorFemale)" />
              </AreaChart>
            </AdvancedChartCard>

            {/* 2. Demographic Entropy */}
            <AdvancedChartCard
              title="Demographic Entropy"
              subtitle="Top Cities by Population Diversity"
              icon={Users}
            >
              <BarChart data={entropyData} layout="vertical" margin={{ left: 20 }} barSize={24}>
                <defs>
                  <linearGradient id="gradEntropy" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="url(#gradEntropy)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </AdvancedChartCard>

            {/* 3. Wealth Trajectory */}
            <AdvancedChartCard
              title="Wealth Trajectory"
              subtitle="Income vs Velocity by Age Group"
              icon={DollarSign}
            >
              <ComposedChart data={wealthData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#14b8a6' }} tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#f59e0b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="Income" fill="url(#colorIncome)" stroke="#14b8a6" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="Velocity" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
              </ComposedChart>
            </AdvancedChartCard>

            {/* 4. Mortality Hazard */}
            <AdvancedChartCard
              title="Mortality Hazard"
              subtitle="Hazard Probability by Income Quintile"
              icon={Scale}
            >
              <BarChart data={mortalityData} barGap={0} barSize={32}>
                <defs>
                  <linearGradient id="gradWhite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="gradBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="gradAsian" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="gradNative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="white" name="White" stackId="a" fill="url(#gradWhite)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="black" name="Black" stackId="a" fill="url(#gradBlack)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="asian" name="Asian" stackId="a" fill="url(#gradAsian)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="native" name="Native" stackId="a" fill="url(#gradNative)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </AdvancedChartCard>

          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
