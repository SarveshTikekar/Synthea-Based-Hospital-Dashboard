import React from "react";
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { BarChart3, TrendingUp, History } from "lucide-react";

const MetricsCard = ({ title, metrics, chartData, chartType = "line" }) => {
  
  // Helper to transform Spark [{ "2025": 10 }] -> [{ name: "2025", value: 10 }]
  const formattedData = chartData?.map(item => {
    const year = Object.keys(item)[0];
    return { name: year, value: item[year] };
  }).reverse(); // Latest year on the right

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-12">
      
      {/* Sidebar: Current Values (1/3 Width) */}
      <div className="lg:col-span-4 p-8 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-white rounded-xl shadow-sm">
            <BarChart3 size={22} className="text-teal-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Summary</p>
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-teal-200 transition-colors">
              <span className="text-sm font-bold text-slate-500">{metric.label}</span>
              <span className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Area (2/3 Width) */}
      <div className="lg:col-span-8 p-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-500" />
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Historical Trend</h4>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <History size={12} />
            10-YEAR DATA
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={11} 
                  fontWeight={700} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis 
                  fontSize={11} 
                  fontWeight={700} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#14b8a6', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#14b8a6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorMetric)"
                  animationDuration={1500}
                />
              </AreaChart>
            ) : (
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis fontSize={11} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: 'rgba(20, 184, 166, 0.05)'}} />
                <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
