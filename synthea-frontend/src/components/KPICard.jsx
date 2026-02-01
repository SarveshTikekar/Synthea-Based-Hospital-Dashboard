import React from "react";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

const KPICard = ({ kpis }) => {
  // kpis: array of { title, value, prevValue, periodType, sentiment, icon: IconComponent, iconColor }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;

        // Calculate Delta
        // Calculate Delta
        const diff = kpi.value - (kpi.prevValue || 0);
        const percentage = kpi.prevValue ? (diff / kpi.prevValue) * 100 : 0;

        // Sentiment Logic: Is an increase good or bad?
        const isIncrease = diff > 0;
        const higherIsBetter = kpi.sentiment !== "lower-is-better";
        const isPositiveChange = isIncrease ? higherIsBetter : !higherIsBetter;

        // Styling based on change
        const statusColor = diff === 0 ? "text-slate-400" : isPositiveChange ? "text-emerald-500" : "text-rose-500";
        const statusBg = diff === 0 ? "bg-slate-50" : isPositiveChange ? "bg-emerald-50" : "bg-rose-50";

        return (
          <div
            key={index}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top Row: Icon & Delta Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${kpi.iconBg || 'bg-slate-50'} ${kpi.iconColor || 'text-slate-600'} transition-colors group-hover:bg-teal-500 group-hover:text-white`}>
                <Icon size={20} />
              </div>

              {kpi.prevValue !== undefined && (
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black ${statusColor} ${statusBg} border border-white shadow-sm`}>
                  {isIncrease ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(percentage).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Label & Value */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {kpi.title}
                <Info size={10} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </h3>
            </div>

            {/* Footer: Previous Period Info */}
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-medium">
                Vs. last <span className="lowercase">{kpi.periodType || 'period'}</span>:
                <span className="text-slate-700 font-bold ml-1">
                  {kpi.prevValue?.toLocaleString() || 'N/A'}
                </span>
              </p>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-2 -right-2 text-slate-50 opacity-10 group-hover:text-teal-500 transition-colors">
              <Icon size={60} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICard;
