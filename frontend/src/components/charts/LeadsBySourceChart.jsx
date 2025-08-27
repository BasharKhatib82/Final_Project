// src/components/charts/LeadsBySourceChart.jsx
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

const LeadsBySourceChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.source),
    datasets: [
      {
        label: "פניות",
        data: data.map((item) => item.count),
        backgroundColor: "#10b981", // green-500
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ מתיחה מלאה לגובה/רוחב הכרטיסיה
    plugins: {
      legend: {
        display: false,
      },
    },
    indexAxis: "x", // גרף עמודות רגיל
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        פניות לפי מקור
      </h3>
      <div className="flex-grow w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsBySourceChart;
