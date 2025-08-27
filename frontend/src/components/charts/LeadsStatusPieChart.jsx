// components/charts/LeadsStatusPieChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadsStatusPieChart = ({ data }) => {
  const chartData = {
    labels: ["חדש", "בטיפול", "טופל"],
    datasets: [
      {
        data: [data.new, data.in_progress, data.completed],
        backgroundColor: ["#f87171", "#facc15", "#4ade80"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-center font-semibold mb-4">סטטוס פניות</h3>
      <Doughnut data={chartData} />
    </div>
  );
};

export default LeadsStatusPieChart;
