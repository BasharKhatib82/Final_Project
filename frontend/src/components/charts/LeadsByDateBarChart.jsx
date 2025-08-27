// src/components/charts/LeadsByDateBarChart.jsx
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
    labels: dataByDay.map((item) =>
      new Date(item.date).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
      })
    ),
    datasets: [
      {
        label: "פניות",
        data: dataByDay.map((item) => item.count),
        backgroundColor: "#3b82f6", // blue-500
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ מתיחה מלאה לגובה הכרטיסיה
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        פניות לפי תאריך
      </h3>
      <div className="flex-grow w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsByDateBarChart;
