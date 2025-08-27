// src/components/charts/LeadsByUserChart.jsx
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

const LeadsByUserChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "פניות",
        data: data.map((item) => item.count),
        backgroundColor: "#8b5cf6", // purple-500
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y", // אופקי
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        פניות לפי עובד
      </h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default LeadsByUserChart;
