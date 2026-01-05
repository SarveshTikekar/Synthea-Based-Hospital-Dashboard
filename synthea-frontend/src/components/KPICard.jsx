import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const KPICard = ({ kpis }) => {
  // kpis: array of { key, title, value, displayValue, icon, iconColor, prevValue }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const prevValue = kpi.prevValue || Math.ceil(kpi.value * 0.95); // Default mock if not provided
        const delta = ((kpi.value - prevValue) / prevValue) * 100;
        const isPositive = delta >= 0;
        return (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Icon size={24} className={kpi.iconColor} />
              <div className="text-right">
                <p className={`text-sm font-bold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {Math.abs(delta).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">vs last period</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.displayValue || kpi.value}</p>
            <p className="text-xs text-gray-500">Prev: {prevValue.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};

export default KPICard;