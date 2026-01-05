import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const MetricsCard = ({ title, metrics, chartData, chartType = "bar" }) => {
  // title: string
  // metrics: array of { label, value }
  // chartData: array for chart (e.g., [{ name, value }])
  // chartType: "bar" (extendable to "line")
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Values List */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
          <BarChart3 size={24} className="text-teal-600" />
          {title || "Key Metrics Values"}
        </h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600">{metric.label}</span>
              <span className="font-bold text-gray-900">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title || "Metrics"} Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip formatter={(value) => [value, "Value"]} />
            <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsCard;