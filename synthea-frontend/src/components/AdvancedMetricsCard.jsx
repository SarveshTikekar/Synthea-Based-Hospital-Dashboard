import React from "react";
import { Scatter } from "react-chartjs-2";
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { Activity } from "lucide-react";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const AdvancedMetricsCard = ({ title, correlationValue, scatterData }) => {
  // title: string
  // correlationValue: number
  // scatterData: { datasets: [{ label, data: [{x, y}], backgroundColor, ... }] }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `X: ${context.parsed.x.toFixed(1)}, Y: ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "X-Axis" } },
      y: { title: { display: true, text: "Y-Axis" } },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
        <Activity size={24} className="text-teal-600" />
        {title || "Advanced Metrics"}
      </h3>
      <p className="text-gray-600 mb-4">Correlation: {(correlationValue || 0).toFixed(2)}</p>
      <div style={{ height: "300px" }}>
        <Scatter data={scatterData} options={options} />
      </div>
    </div>
  );
};

export default AdvancedMetricsCard;