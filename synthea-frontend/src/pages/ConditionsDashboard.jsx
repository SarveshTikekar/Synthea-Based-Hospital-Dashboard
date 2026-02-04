import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { conditionsDashboard } from "@/api/api";
import {
	Activity, CheckCircle, GitMerge, Clock, Hospital, Calendar,
	Stethoscope, FileText, Zap, AlertTriangle
} from "lucide-react";
import KPICard from "@/components/KPICard";
import MetricsCard from "@/components/MetricsCard";
import AdvancedChartCard from "@/components/AdvancedChartCard";
import {
	BarChart, Bar, PieChart, Pie, Cell, ScatterChart,
	Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from "recharts";

// --- Colors & Gradients ---
const COLORS = {
	teal: ["#14b8a6", "#0d9488"],
	purple: ["#8b5cf6", "#7c3aed"],
	rose: ["#f43f5e", "#e11d48"],
	amber: ["#f59e0b", "#d97706"],
	blue: ["#3b82f6", "#2563eb"],
	slate: ["#64748b", "#475569"]
};

const PIE_COLORS = ["#14b8a6", "#f43f5e", "#8b5cf6", "#f59e0b", "#3b82f6"];

const ConditionsDashboard = () => {
	const [data, setData] = useState({ kpis: {}, metrics: {} });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await conditionsDashboard();
				if (result?.conditions_dashboard) {
					setData({
						kpis: result.conditions_dashboard.kpis || {},
						metrics: result.conditions_dashboard.metrics || {}
					});
				} else {
					setError("Failed to load conditions data.");
				}
			} catch (err) {
				setError("Error fetching dashboard data.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// --- Data Transformation Helpers ---

	// Transform [{"Diabetes": 50}, {"Asthma": 30}] -> [{name: "Diabetes", value: 50}, ...]
	// Transform [{"Diabetes": 50}, {"Asthma": 30}] OR [{"Chronic": 50, "Acute": 30}] -> [{name: "Key", value: Val}, ...]
	const transformList = (list) => {
		if (!list) return [];
		return list.flatMap(item => {
			return Object.keys(item).map(key => ({ name: key, value: item[key] }));
		});
	};

	// Transform Tuple [(Name, Freq, Time)] -> [{name, x: Time, y: Freq, z: Size}]
	const transformScatter = (list) => {
		if (!list) return [];
		return list.map((item) => ({
			name: item[0],
			y: item[1], // Frequency
			x: item[2], // Days to Cure
			z: 100 // Bubble Size (Static for now, or could depend on complexity)
		}));
	};

	// --- Memoized Data ---
	const topDisorders = useMemo(() => transformList(data.metrics.top_disorder_conditions), [data]);
	const chronicVsAcute = useMemo(() => transformList(data.metrics.chronic_vs_acute), [data]);
	const comorbidity = useMemo(() => transformList(data.metrics.commorbidity_pattern), [data]);
	const recurring = useMemo(() => transformList(data.metrics.top_10_recurring_disorders), [data]);
	const resolutionEff = useMemo(() => transformScatter(data.metrics.disease_resolution_efficiency), [data]);

	// --- KPI Configuration ---
	const kpiData = [
		{
			title: "Active Burden",
			value: data.kpis.current_active_burden || 0,
			icon: Activity,
			iconBg: "bg-rose-50",
			iconColor: "text-rose-600",
			periodType: "active cases"
		},
		{
			title: "Recovery Rate",
			value: `${(data.kpis.global_recovery_rate || 0).toFixed(1)}%`,
			icon: CheckCircle,
			iconBg: "bg-teal-50",
			iconColor: "text-teal-600",
			sentiment: "higher-is-better"
		},
		{
			title: "Avg Complexity",
			value: data.kpis.patient_complexity_score || 0,
			icon: GitMerge,
			iconBg: "bg-purple-50",
			iconColor: "text-purple-600",
			periodType: "conds/patient"
		},
		{
			title: "Avg Time to Cure",
			value: `${data.kpis.average_time_to_cure || 0}d`,
			icon: Clock,
			iconBg: "bg-amber-50",
			iconColor: "text-amber-600",
			sentiment: "lower-is-better"
		},
		{
			title: "Admissions (30d)",
			value: data.kpis.admission_rate_last_30_days || 0,
			icon: Hospital,
			iconBg: "bg-blue-50",
			iconColor: "text-blue-600"
		},

	];

	if (loading) {
		return (
			<div className="flex min-h-screen w-full bg-slate-50">
				<Navbar />
				<div className="flex-1 flex flex-col items-center justify-center">
					<Activity size={48} className="animate-spin text-teal-600 mb-4" />
					<h2 className="text-xl font-bold text-slate-700">Loading Pathology Data...</h2>
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
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-teal-50 rounded-lg">
								<Stethoscope size={24} className="text-teal-600" />
							</div>
							<h1 className="text-3xl font-black text-slate-900 tracking-tight">Conditions & Pathology</h1>
						</div>
						<p className="text-slate-500 font-medium ml-12">Epidemiological trends and disease management effectiveness</p>
					</div>
				</header>

				<main className="p-8 space-y-10 max-w-[1600px] mx-auto w-full">

					{/* Section 1: KPIs */}
					<KPICard kpis={kpiData} />

					{/* Section 2: Core Metrics */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

						{/* Top Disorders */}
						<MetricsCard
							title="Top 10 Active Disorders"
							metrics={[]}
							chartData={topDisorders}
							chartType="bar"
						>
							<ResponsiveContainer width="100%" height={500}>
								<BarChart layout="vertical" data={topDisorders} margin={{ left: 40 }}>
									<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
									<XAxis type="number" hide />
									<YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} tickLine={false} axisLine={false} />
									<Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
									<Bar dataKey="value" fill="url(#gradTeal)" radius={[0, 4, 4, 0]} barSize={24} />
									<defs>
										<linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="0">
											<stop offset="0%" stopColor="#14b8a6" />
											<stop offset="100%" stopColor="#0d9488" />
										</linearGradient>
									</defs>
								</BarChart>
							</ResponsiveContainer>
						</MetricsCard>

						{/* Chronic vs Acute */}
						<MetricsCard
							title="Clinical Course Distribution"
							metrics={[{ label: "Total", value: chronicVsAcute.reduce((acc, curr) => acc + curr.value, 0) }]}
							chartType="pie"
						>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={chronicVsAcute}
										cx="50%"
										cy="50%"
										innerRadius={80}
										outerRadius={110}
										paddingAngle={5}
										dataKey="value"
									>
										{chronicVsAcute.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
									<Legend verticalAlign="bottom" height={36} iconType="circle" />
								</PieChart>
							</ResponsiveContainer>
						</MetricsCard>

						{/* Comorbidity Pattern */}
						<MetricsCard
							title="Comorbidity Distribution"
							metrics={[]}
							chartData={comorbidity}
							chartType="bar"
						>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={comorbidity}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
									<XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
									<YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
									<Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
									<Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
								</BarChart>
							</ResponsiveContainer>
						</MetricsCard>

						{/* Recurring Disorders */}
						<MetricsCard
							title="Top 10 Recurring Disorders"
							metrics={[]}
							chartData={recurring}
							chartType="bar"
						>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={recurring} layout="vertical" margin={{ left: 20 }}>
									<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
									<XAxis type="number" hide />
									<YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
									<Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
									<Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
								</BarChart>
							</ResponsiveContainer>
						</MetricsCard>

					</div>

					{/* Section 3: Advanced Analysis (Resolution Efficiency) */}
					<div className="pt-10 border-t border-slate-200">
						<h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
							<Zap className="text-teal-600 fill-teal-600" /> Advanced Analysis
						</h2>

						<AdvancedChartCard
							title="Disease Resolution Efficiency"
							subtitle="Frequency vs. Avg Cure Time (Top 20 Conditions)"
							icon={Zap}
							rightElement={
								<div className="flex gap-4">
									<div className="flex items-center gap-2 text-xs text-slate-500">
										<div className="w-2 h-2 rounded-full bg-teal-500"></div> Fastest
									</div>
									<div className="flex items-center gap-2 text-xs text-slate-500">
										<div className="w-2 h-2 rounded-full bg-amber-500"></div> Chronic
									</div>
								</div>
							}
						>
							<ResponsiveContainer width="100%" height={400}>
								<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
									<XAxis type="number" dataKey="x" name="Days to Cure" unit="d" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
									<YAxis type="number" dataKey="y" name="Frequency" unit=" cases" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
									<ZAxis type="number" dataKey="z" range={[60, 400]} />
									<Tooltip
										cursor={{ strokeDasharray: '3 3' }}
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return (
													<div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
														<p className="font-bold text-slate-800 mb-2">{data.name}</p>
														<div className="space-y-1 text-xs text-slate-500">
															<div className="flex justify-between gap-4">
																<span>Avg Cure Time:</span>
																<span className="font-mono font-bold text-teal-600">{data.x} days</span>
															</div>
															<div className="flex justify-between gap-4">
																<span>Total Cases:</span>
																<span className="font-mono font-bold text-slate-700">{data.y}</span>
															</div>
														</div>
													</div>
												);
											}
											return null;
										}}
									/>
									<Scatter name="Conditions" data={resolutionEff} fill="#8b5cf6">
										{resolutionEff.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS.teal[index % 2]} />
										))}
									</Scatter>
								</ScatterChart>
							</ResponsiveContainer>
						</AdvancedChartCard>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
							<div className="p-4 bg-teal-50 rounded-2xl flex gap-4 items-start">
								<div className="p-2 bg-white rounded-xl shadow-sm">
									<Clock size={18} className="text-teal-600" />
								</div>
								<div>
									<h4 className="font-bold text-slate-800 text-sm">Target Efficiency</h4>
									<p className="text-xs text-slate-600 mt-1">Conditions on the left (low cure time) indicate effective resolution protocols.</p>
								</div>
							</div>
							<div className="p-4 bg-amber-50 rounded-2xl flex gap-4 items-start">
								<div className="p-2 bg-white rounded-xl shadow-sm">
									<AlertTriangle size={18} className="text-amber-600" />
								</div>
								<div>
									<h4 className="font-bold text-slate-800 text-sm">Chronic Outliers</h4>
									<p className="text-xs text-slate-600 mt-1">Conditions &gt;100 days represent chronic burdens requiring long-term care plans.</p>
								</div>
							</div>
						</div>
					</div>

					<div className="pb-20"></div>
				</main>
			</div>
		</div>
	);
};

export default ConditionsDashboard;
