// components/charts/LeadsByDateBarChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const LeadsByDateBarChart = ({ dataByDay }) => {
  const chartData = {
    labels: dataByDay.map((item) => item.date),
    datasets: [
      {
        label: "כמות פניות",
        data: dataByDay.map((item) => item.count),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-center font-semibold mb-4">פניות לפי תאריך</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default LeadsByDateBarChart;
