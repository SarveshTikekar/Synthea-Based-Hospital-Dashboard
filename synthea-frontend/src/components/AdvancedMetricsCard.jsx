import React from "react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Layers, Zap, Info, TrendingUp, BarChart3 } from "lucide-react";

const AdvancedMetricsCard = ({ title, metrics, charts }) => {
  
  // Helper to transform Spark [{ "2025": 10 }] -> [{ name: "2025", value: 10 }]
  const formatData = (raw) => raw?.map(item => {
    const key = Object.keys(item)[0];
    return { name: key, value: item[key] };
  }).reverse();

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 mb-10 overflow-hidden relative">
      
      {/* Decorative Gradient Flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-400">
            <Layers size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">Multi-Variate Analysis</p>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="flex flex-wrap gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 min-w-[120px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{m.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900">{m.value}</span>
                {m.trend && (
                   <span className={`text-[10px] font-bold ${m.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {m.trend > 0 ? '+' : ''}{m.trend}%
                   </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {charts.slice(0, 2).map((chart, idx) => (
          <div key={idx} className="bg-slate-50/30 p-8 rounded-[2rem] border border-slate-50 relative group transition-all hover:bg-white hover:shadow-lg hover:border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {chart.type === 'line' ? <TrendingUp size={18} className="text-slate-400" /> : <BarChart3 size={18} className="text-slate-400" />}
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">{chart.title}</h4>
              </div>
              <Zap size={14} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === "line" || chart.type === "area" ? (
                  <AreaChart data={formatData(chart.data)}>
                    <defs>
                      <linearGradient id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={idx === 0 ? "#14b8a6" : "#0f172a"} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={idx === 0 ? "#14b8a6" : "#0f172a"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="name" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={idx === 0 ? "#14b8a6" : "#0f172a"} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill={`url(#color-${idx})`} 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={formatData(chart.data)}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="name" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                      {formatData(chart.data).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={idx === 0 ? "#14b8a6" : "#334155"} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedMetricsCard;
