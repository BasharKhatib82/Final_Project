// src/components/charts/LeadsByDateBarChart.jsx

/**
 * רכיב גרפי להצגת פניות לפי תאריכים
 * ------------------------------------------------
 * מציג תרשים עמודות שבו ציר הזמן הוא לפי ימים,
 * וגובה כל עמודה מייצג את מספר הפניות באותו יום.
 *
 * קלט:
 * - [{ date, count }] מערך של אובייקטים : dataByDay
 * פלט:
 * - תרשים עמודות אינטראקטיבי המראה את 7 הימים האחרונים בלבד
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

const LeadsByDateBarChart = ({ dataByDay }) => {
  // מציג רק את 7 הימים האחרונים
  const last7Days = dataByDay.slice(-7);

  const chartData = {
    labels: last7Days.map((item) =>
      new Date(item.date).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
      })
    ),
    datasets: [
      {
        label: "פניות",
        data: last7Days.map((item) => item.count),
        backgroundColor: "#3b82f6", // כחול
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
        פניות לפי 7 ימים אחרונים
      </h3>
      <div className="flex-grow w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsByDateBarChart;
