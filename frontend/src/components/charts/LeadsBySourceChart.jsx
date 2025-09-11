// src/components/charts/LeadsBySourceChart.jsx

/**
 * רכיב גרפי להצגת פניות לפי מקור
 * ------------------------------------------------
 * מציג תרשים עמודות שבו הציר הוא "מקור הפניה"
 * וגובה כל עמודה מייצג את מספר הפניות מאותו מקור
 * ב־30 הימים האחרונים בלבד.
 */
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
  // חישוב תאריך של 30 ימים אחורה מהיום
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  // סינון רק רשומות מה  30 ימים האחרונים
  const last30Days = data.filter((item) => new Date(item.date) >= cutoff);

  const chartData = {
    labels: last30Days.map((item) => item.source),
    datasets: [
      {
        label: "פניות",
        data: last30Days.map((item) => item.count),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        פניות לפי מקור 30 ימים אחרונים
      </h3>
      <div className="flex-grow w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsBySourceChart;
